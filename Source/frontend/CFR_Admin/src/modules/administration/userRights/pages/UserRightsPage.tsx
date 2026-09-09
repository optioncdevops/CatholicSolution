import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Eye, Save, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Dropdown } from '@app/components/formControls';
import { confirmAction } from '../../../lib/confirm';
import { getUserRoles } from '../../userRoles/services/userRolesService';
import { normalizeUserRolesList } from '../../userRoles/utils/userRolesHelpers';
import type { UserRolesApiItem } from '../../userRoles/types/userRolesTypes';
import { getUserRights, saveUserRights } from '../services/userRightsService';
import {
  buildUserRightsTree, collectAllFeatureIds, collectFeatureIdsForLevel, computeRowRollup, flattenUserRightsTree,
  levelsForKind, mergePendingChange, toPendingChangeList, type RowRollup,
} from '../utils/userRightsHelpers';
import type { AccessLevel, UserRightsFeatureNode } from '../types/userRightsTypes';

type PageStatus = 'loading' | 'ready' | 'error';

const ACCESS_LEVEL_LABEL: Record<AccessLevel, string> = { access: 'Access', readOnly: 'Read Only', denied: 'Denied' };

//#region Presentational subcomponents
/** Three-state Access / Read Only / Denied toggle. `AccessRight` is a plain SQL int (not a bit),
 * so this genuinely persists all three states — 0/1/2 — with no schema change. A mixed rollup
 * (descendants disagree) leaves every pill unselected, the same way the prior prototype signaled
 * "mixed". Clicking any pill applies that level to the row's whole subtree at once, so setting a
 * module's permission is a real "apply to all [its features]" action, not just that one row. */
function PermissionToggle({ idPrefix, label, rollup, levels, onChange, disabled }: {
  idPrefix: string; label: string; rollup: RowRollup; levels: AccessLevel[]; onChange: (next: AccessLevel) => void; disabled?: boolean;
}) {
  return (
    <div role="group" aria-label={`Access for ${label}`} className="flex gap-1.5">
      <CommonButton
        id={`btnAccess${idPrefix}`}
        type="button" size="xs" disabled={disabled}
        variant={rollup === 'access' ? 'success' : 'outline'}
        onClick={() => onChange('access')}
      >
        Access
      </CommonButton>
      {levels.includes('readOnly') ? (
        <CommonButton
          id={`btnReadOnly${idPrefix}`}
          type="button" size="xs" disabled={disabled}
          variant={rollup === 'readOnly' ? 'primary' : 'outline'}
          onClick={() => onChange('readOnly')}
        >
          Read Only
        </CommonButton>
      ) : null}
      <CommonButton
        id={`btnDenied${idPrefix}`}
        type="button" size="xs" disabled={disabled}
        variant={rollup === 'denied' ? 'danger' : 'outline'}
        onClick={() => onChange('denied')}
      >
        Denied
      </CommonButton>
    </div>
  );
}

function SectionSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => <div key={index} className="admin-skeleton h-9 w-full" />)}
    </div>
  );
}
//#endregion

export function UserRightsPage() {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [roles, setRoles] = useState<UserRolesApiItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleId, setRoleId] = useState<number | null>(null);

  const [status, setStatus] = useState<PageStatus>('loading');
  const [tree, setTree] = useState<UserRightsFeatureNode[]>([]);
  const [moduleFilter, setModuleFilter] = useState<number | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState<Map<number, AccessLevel>>(new Map());
  const [saving, setSaving] = useState(false);
  const [applyingAll, setApplyingAll] = useState(false);
  //#endregion

  //#region Functions
  // Reused after a successful save to pull the freshly-persisted state back down — the mount/
  // role-change fetch below is a separate, cancellable inline effect (not this function) so that
  // effect-driven loads and refresh-after-mutation loads stay independent.
  const loadRights = useCallback(async (forRoleId: number) => {
    setStatus('loading');
    setPending(new Map());
    try {
      const { resultData } = await getUserRights(forRoleId, -1);
      const nextTree = buildUserRightsTree(resultData);
      setTree(nextTree);
      setExpanded(new Set(collectAllFeatureIds(nextTree)));
      setStatus('ready');
    } catch (error) {
      console.error('Error loading user rights:', error);
      showToast('Failed to load user rights.', 'error');
      setTree([]);
      setStatus('error');
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setRolesLoading(true);
      try {
        const { resultData, statusCode } = await getUserRoles();
        if (cancelled) return;
        const list = statusCode === 204 ? [] : normalizeUserRolesList(resultData);
        setRoles(list);
        setRoleId((current) => current ?? list[0]?.roleId ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading user roles:', error);
        showToast('Failed to load user roles.', 'error');
        setRoles([]);
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [showToast]);

  useEffect(() => {
    if (roleId == null) return;
    let cancelled = false;
    void (async () => {
      setStatus('loading');
      setPending(new Map());
      try {
        const { resultData } = await getUserRights(roleId, -1);
        if (cancelled) return;
        const nextTree = buildUserRightsTree(resultData);
        setTree(nextTree);
        setExpanded(new Set(collectAllFeatureIds(nextTree)));
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading user rights:', error);
        showToast('Failed to load user rights.', 'error');
        setTree([]);
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [roleId, showToast]);
  //#endregion

  const selectedRole = roles.find((role) => role.roleId === roleId);

  // Effective (pending-change-aware) level for a feature — what its row should actually show.
  const effectiveLevel = useCallback((featureId: number): AccessLevel => {
    if (pending.has(featureId)) return pending.get(featureId)!;
    const find = (nodes: UserRightsFeatureNode[]): UserRightsFeatureNode | undefined => {
      for (const node of nodes) {
        if (node.featureId === featureId) return node;
        const found = find(node.children);
        if (found) return found;
      }
      return undefined;
    };
    return find(tree)?.accessLevel ?? 'denied';
  }, [pending, tree]);

  const moduleOptions = useMemo(
    () => [{ id: 'all', value: 'All Modules' }, ...tree.map((node) => ({ id: String(node.featureId), value: node.label }))],
    [tree],
  );

  const visibleTree = useMemo(
    () => (moduleFilter === 'all' ? tree : tree.filter((node) => node.featureId === moduleFilter)),
    [tree, moduleFilter],
  );

  const rows = useMemo(() => flattenUserRightsTree(visibleTree, 0, expanded), [visibleTree, expanded]);

  const dirtyCount = pending.size;

  // Real counts across every feature currently loaded for this role, pending-change aware — not
  // a fabricated prototype default.
  const { accessCount, readOnlyCount, deniedCount } = useMemo(() => {
    const levels = collectAllFeatureIds(tree).map(effectiveLevel);
    return {
      accessCount: levels.filter((level) => level === 'access').length,
      readOnlyCount: levels.filter((level) => level === 'readOnly').length,
      deniedCount: levels.filter((level) => level === 'denied').length,
    };
  }, [tree, effectiveLevel]);

  //#region Handlers
  const handleToggleExpanded = (featureId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) next.delete(featureId); else next.add(featureId);
      return next;
    });
  };

  const handleToggleRow = (node: UserRightsFeatureNode, next: AccessLevel) => {
    // Each row's access is independent — toggling a parent (Module/Feature) must NOT change its
    // children; every node keeps its own separately-persisted value. Bulk-changing a whole branch
    // at once is what "Apply to all" is for (see handleApplyToAll below).
    setPending((prev) => mergePendingChange(prev, node.featureId, next));
  };

  const handleClearFilters = () => {
    setModuleFilter('all');
    showToast('Filters cleared.', 'success');
  };

  const handleDiscard = () => {
    setPending(new Map());
    showToast('Unsaved changes discarded.', 'success');
  };

  // Bulk "apply to all" — scoped to the currently visible (module-filtered) set, matching what's
  // on screen rather than silently touching hidden rows. Read Only only ever lands on
  // Feature-kind rows (see levelsForKind) — Module/Activity rows in scope are left untouched
  // rather than clamped to some other value the user didn't ask for. Confirmed first since it can
  // affect a large number of features in one action.
  const handleApplyToAll = async (level: AccessLevel) => {
    const allIds = collectAllFeatureIds(visibleTree);
    const featureIds = collectFeatureIdsForLevel(visibleTree, level);
    if (featureIds.length === 0) return;
    const skippedCount = allIds.length - featureIds.length;
    const scopeLabel = moduleFilter === 'all' ? 'every module' : moduleOptions.find((option) => option.id === String(moduleFilter))?.value ?? 'this module';
    const confirmed = await confirmAction({
      title: `Set ${ACCESS_LEVEL_LABEL[level]} for ${scopeLabel}?`,
      description: `This queues ${featureIds.length} feature${featureIds.length === 1 ? '' : 's'} to ${ACCESS_LEVEL_LABEL[level].toLowerCase()} for ${selectedRole?.roleName ?? 'this role'}.`
        + (skippedCount > 0 ? ` ${skippedCount} module/activity-level row${skippedCount === 1 ? '' : 's'} in scope don't support Read Only and will be left as-is.` : '')
        + ' Review the matrix and click Save to persist it.',
      confirmLabel: `Set all to ${ACCESS_LEVEL_LABEL[level]}`,
      tone: level === 'denied' ? 'danger' : 'primary',
    });
    if (!confirmed) return;

    setApplyingAll(true);
    setPending((prev) => {
      let updated = prev;
      for (const featureId of featureIds) updated = mergePendingChange(updated, featureId, level);
      return updated;
    });
    showToast(`${featureIds.length} feature${featureIds.length === 1 ? '' : 's'} queued as ${ACCESS_LEVEL_LABEL[level]} — click Save to persist.`, 'success');
    setApplyingAll(false);
  };

  const handleSave = async () => {
    if (roleId == null || dirtyCount === 0) return;
    setSaving(true);
    try {
      const changes = toPendingChangeList(pending);
      await saveUserRights(roleId, changes);
      showToast(`Rights updated for ${selectedRole?.roleName ?? 'this role'}.`, 'success');
      await loadRights(roleId);
    } catch (error) {
      console.error('Error saving user rights:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save user rights.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  if (!rolesLoading && roles.length === 0) {
    return (
      <div className="admin-reveal flex flex-col gap-4">
        <PanelHeader title="User Rights" />
        <EmptyState icon="🛡️" title="No roles yet" description="Add a role under User Roles before configuring rights." />
      </div>
    );
  }

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="User Rights" />
      <p className="-mt-2 text-xs text-[var(--text-muted)]">
        Per-role access to every module, submenu, and activity in CFR Acutis. Changes take effect the next time a user with this role signs in.
      </p>

      <section className="admin-panel-card">
        <div className="flex flex-wrap items-end justify-between gap-3 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56 shrink-0">
              <Dropdown
                id="ddlUserRightsRole"
                label="Role" searchable={false} clearable={false}
                value={roleId != null ? String(roleId) : undefined}
                onValueChange={(value) => setRoleId(value ? Number(value) : null)}
                options={roles.map((role) => ({ id: String(role.roleId), value: role.roleName }))}
                disabled={rolesLoading}
              />
            </div>
            <div className="w-56 shrink-0">
              <Dropdown
                id="ddlUserRightsModule"
                label="Module" searchable={false} clearable={false}
                value={String(moduleFilter)}
                onValueChange={(value) => setModuleFilter(value === 'all' || !value ? 'all' : Number(value))}
                options={moduleOptions}
                disabled={status === 'loading'}
              />
            </div>
            <CommonButton id="btnClearUserRightsFilters" variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </CommonButton>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--text-faint)]">Apply to all shown:</span>
            <CommonButton id="btnApplyAllAccess" variant="outline" size="sm" iconLeft={<ShieldCheck size={13} />} disabled={status !== 'ready' || applyingAll || saving} onClick={() => void handleApplyToAll('access')}>
              Access
            </CommonButton>
            <CommonButton id="btnApplyAllReadOnly" variant="outline" size="sm" iconLeft={<Eye size={13} />} disabled={status !== 'ready' || applyingAll || saving} onClick={() => void handleApplyToAll('readOnly')}>
              Read Only
            </CommonButton>
            <CommonButton id="btnApplyAllDenied" variant="outline" size="sm" iconLeft={<ShieldOff size={13} />} disabled={status !== 'ready' || applyingAll || saving} onClick={() => void handleApplyToAll('denied')}>
              Denied
            </CommonButton>
          </div>
        </div>
        {status === 'ready' && selectedRole ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--line-soft)] px-4 py-2.5 text-xs">
            <span className="font-bold text-[var(--text-primary)]">Editing rights for {selectedRole.roleName}:</span>
            <span className="flex items-center gap-1.5 font-bold text-[var(--success)]">
              <span className="size-2 rounded-full bg-[var(--success)]" aria-hidden="true" /> {accessCount} Access
            </span>
            <span className="flex items-center gap-1.5 font-bold text-[var(--primary)]">
              <span className="size-2 rounded-full bg-[var(--primary)]" aria-hidden="true" /> {readOnlyCount} Read Only
            </span>
            <span className="flex items-center gap-1.5 font-bold text-[var(--error)]">
              <span className="size-2 rounded-full bg-[var(--error)]" aria-hidden="true" /> {deniedCount} Denied
            </span>
            <span className="text-[var(--text-faint)]">
              Changes save to the database and apply the next time a user with this role signs in.
            </span>
          </div>
        ) : null}
      </section>

      {status === 'error' ? (
        <EmptyState icon="⚠️" title="Couldn't load user rights" description="Try selecting the role again, or refresh the page." actionLabel="Retry" onAction={() => roleId != null && void loadRights(roleId)} />
      ) : status === 'loading' ? (
        <section className="admin-panel-card"><SectionSkeleton /></section>
      ) : rows.length === 0 ? (
        <EmptyState icon="🔍" title="No matches" description="Try a different module filter." />
      ) : (
        <section className="admin-panel-card">
          <div className="overflow-x-auto">
            <table id="tblUserRights" className="admin-table">
              <caption className="sr-only">User rights matrix for {selectedRole?.roleName ?? 'the selected role'}</caption>
              <thead>
                <tr>
                  <th scope="col">Module / Feature / Activity</th>
                  <th scope="col">Description</th>
                  <th scope="col">Permission</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ node, depth }) => {
                  const rollup = computeRowRollup(node, effectiveLevel);
                  const hasChildren = node.children.length > 0;
                  const isExpanded = expanded.has(node.featureId);
                  return (
                    <tr key={node.featureId} id={`rowFeature${node.featureId}`}>
                      <td style={{ paddingLeft: `${depth * 1.25}rem` }}>
                        <span className="flex items-center gap-1.5">
                          {hasChildren ? (
                            <button
                              id={`ibtnToggleFeature${node.featureId}`}
                              type="button"
                              aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
                              onClick={() => handleToggleExpanded(node.featureId)}
                              className="grid size-5 shrink-0 place-items-center rounded text-[var(--text-faint)] hover:bg-[var(--hover)]"
                            >
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ) : (
                            <span className="inline-block size-5 shrink-0" aria-hidden="true" />
                          )}
                          <span className={depth === 0 ? 'font-extrabold text-[var(--text-primary)]' : depth === 1 ? 'font-bold text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}>
                            {node.label}
                          </span>
                        </span>
                      </td>
                      <td className="text-[var(--text-muted)]">{node.description || '—'}</td>
                      <td>
                        <PermissionToggle
                          idPrefix={`Feature${node.featureId}`}
                          label={node.label}
                          rollup={rollup}
                          levels={levelsForKind(node.kind)}
                          onChange={(next) => handleToggleRow(node, next)}
                          disabled={saving}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="admin-sticky-footer">
        <CommonButton id="btnCancelUserRights" variant="outline" iconLeft={<X size={14} />} onClick={handleDiscard} disabled={dirtyCount === 0 || saving}>
          Cancel
        </CommonButton>
        <CommonButton id="btnSaveUserRights" variant="primary" iconLeft={<Save size={14} />} onClick={() => void handleSave()} loading={saving} disabled={dirtyCount === 0 || saving}>
          Save
        </CommonButton>
      </div>
    </div>
  );
  //#endregion
}

export default UserRightsPage;
