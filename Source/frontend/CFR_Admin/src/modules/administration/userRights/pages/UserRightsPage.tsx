import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw, Save } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { CommonCheckbox, Dropdown } from '@app/components/formControls';
import { getUserRoles } from '../../userRoles/services/userRolesService';
import { normalizeUserRolesList } from '../../userRoles/utils/userRolesHelpers';
import type { UserRolesApiItem } from '../../userRoles/types/userRolesTypes';
import { getUserRights, saveUserRights } from '../services/userRightsService';
import {
  buildUserRightsTree, collectAllFeatureIds, collectSubtreeFeatureIds, computeRowRollup, flattenUserRightsTree,
  mergePendingChange, toPendingChangeList,
} from '../utils/userRightsHelpers';
import type { UserRightsFeatureNode } from '../types/userRightsTypes';

type PageStatus = 'loading' | 'ready' | 'error';

//#region Presentational subcomponents
function RightsRowCheckbox({ id, label, rollup, onChange, disabled }: {
  id: string; label: string; rollup: 'checked' | 'unchecked' | 'mixed'; onChange: (next: boolean) => void; disabled?: boolean;
}) {
  return (
    <CommonCheckbox
      id={id}
      label={label}
      hideLabel
      checked={rollup === 'checked'}
      indeterminate={rollup === 'mixed'}
      onCheckedChange={(next) => onChange(next)}
      disabled={disabled}
    />
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
  const [pending, setPending] = useState<Map<number, boolean>>(new Map());
  const [saving, setSaving] = useState(false);
  //#endregion

  //#region Functions
  // Reused after a successful save to pull the freshly-persisted state back down — the mount/
  // role-change fetch below is a separate, cancellable inline effect (not this function) so that
  // effect-driven loads and refresh-after-mutation loads stay independent.
  const loadRights = useCallback(async (forRoleId: number) => {
    setStatus('loading');
    setPending(new Map());
    try {
      const { resultData } = await getUserRights(forRoleId, 0);
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
        const { resultData } = await getUserRights(roleId, 0);
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

  // Effective (pending-change-aware) access for a feature — what the checkbox should actually show.
  const effectiveAccess = useCallback((featureId: number): boolean => {
    if (pending.has(featureId)) return pending.get(featureId)!;
    const find = (nodes: UserRightsFeatureNode[]): UserRightsFeatureNode | undefined => {
      for (const node of nodes) {
        if (node.featureId === featureId) return node;
        const found = find(node.children);
        if (found) return found;
      }
      return undefined;
    };
    return find(tree)?.accessRight ?? false;
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

  //#region Handlers
  const handleToggleExpanded = (featureId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) next.delete(featureId); else next.add(featureId);
      return next;
    });
  };

  const handleToggleRow = (node: UserRightsFeatureNode, next: boolean) => {
    setPending((prev) => {
      let updated = prev;
      for (const featureId of collectSubtreeFeatureIds(node)) {
        updated = mergePendingChange(updated, featureId, next);
      }
      return updated;
    });
  };

  const handleClearFilters = () => {
    setModuleFilter('all');
    showToast('Filters cleared.', 'success');
  };

  const handleDiscard = () => {
    setPending(new Map());
    showToast('Unsaved changes discarded.', 'success');
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
        <div className="flex flex-wrap items-end gap-3 p-4">
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
                  <th scope="col">Access</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ node, depth }) => {
                  const rollup = computeRowRollup(node, effectiveAccess);
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
                        <RightsRowCheckbox
                          id={`chkFeatureAccess${node.featureId}`}
                          label={`Toggle access to ${node.label}`}
                          rollup={rollup}
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

      <div className="admin-sticky-footer flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {dirtyCount > 0 ? `${dirtyCount} unsaved change${dirtyCount === 1 ? '' : 's'}` : 'No unsaved changes'}
        </span>
        <div className="flex items-center gap-2">
          <CommonButton id="btnDiscardUserRightsChanges" variant="outline" iconLeft={<RotateCcw size={14} />} onClick={handleDiscard} disabled={dirtyCount === 0 || saving}>
            Discard
          </CommonButton>
          <CommonButton id="btnSaveUserRights" variant="primary" iconLeft={<Save size={14} />} onClick={() => void handleSave()} loading={saving} disabled={dirtyCount === 0 || saving}>
            Save Changes
          </CommonButton>
        </div>
      </div>
    </div>
  );
  //#endregion
}

export default UserRightsPage;
