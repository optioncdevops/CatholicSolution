import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { Dropdown, InputField } from '@app/components/formControls';
import { ALL_RIGHTS_NODE_IDS, RIGHTS_TREE, TOTAL_ACTIVITY_COUNT, collectLeafIds, type RightsNode } from './rightsTree';
import type { PermissionLevel } from '../types';

type RollupLevel = PermissionLevel | 'mixed';

const PERMISSION_LEVELS: Array<{ id: PermissionLevel; label: string }> = [
  { id: 'full-control', label: 'Full Control' },
  { id: 'read-only', label: 'Read Only' },
  { id: 'deny', label: 'Deny' },
];

const PERMISSION_TOGGLE_CLASS: Record<PermissionLevel, string> = {
  'read-only': 'border-[var(--info)]/40 bg-[var(--info-bg)] text-[var(--info)]',
  'full-control': 'border-[var(--success)]/40 bg-[var(--success-bg)] text-[var(--success)]',
  deny: 'border-[var(--error)]/40 bg-[var(--error-bg)] text-[var(--error)]',
};

/** Blanket default permission for a role when no explicit choice has been made yet. */
const ROLE_DEFAULT_LEVEL: Record<string, PermissionLevel> = {
  'role-super-admin': 'full-control',
  'role-org-admin': 'full-control',
  'role-support-agent': 'read-only',
  'role-billing-manager': 'read-only',
  'role-content-editor': 'read-only',
  'role-viewer': 'read-only',
};

/** Per-top-level-module overrides of the blanket default, keyed by role then module id. */
const ROLE_MODULE_OVERRIDES: Record<string, Record<string, PermissionLevel>> = {
  'role-org-admin': { administration: 'deny' },
  'role-support-agent': { requests: 'full-control', administration: 'deny', products: 'deny' },
  'role-billing-manager': { organizations: 'full-control', administration: 'deny' },
  'role-content-editor': { products: 'full-control', administration: 'deny' },
};

interface FlatRow {
  node: RightsNode;
  depth: number;
  moduleId: string;
}

/** Compact segmented control — the single interactive surface for every row's permission.
 * On a leaf (Activity) row it sets that one permission; on a Module/Feature row it bulk-applies
 * the chosen level to every Activity underneath, the standard "cascade to children" pattern
 * for permission trees. `value: 'mixed'` (some descendants differ) leaves every pill unselected. */
function PermissionToggle({ value, onChange, disabled }: { value: RollupLevel; onChange: (level: PermissionLevel) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1" role="group">
      {PERMISSION_LEVELS.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive ? PERMISSION_TOGGLE_CLASS[option.id] : 'border-[var(--line)] bg-transparent text-[var(--text-faint)] hover:bg-[var(--hover)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function nodeMatches(node: RightsNode, needle: string): boolean {
  return node.label.toLowerCase().includes(needle) || (node.description ?? '').toLowerCase().includes(needle);
}

function filterTree(nodes: RightsNode[], needle: string): RightsNode[] {
  if (!needle) return nodes;
  const result: RightsNode[] = [];
  for (const node of nodes) {
    const selfMatch = nodeMatches(node, needle);
    const filteredChildren = node.children ? filterTree(node.children, needle) : undefined;
    if (selfMatch || (filteredChildren && filteredChildren.length > 0)) {
      result.push({ ...node, children: selfMatch ? node.children : filteredChildren });
    }
  }
  return result;
}

function flatten(nodes: RightsNode[], depth: number, moduleId: string | null, expanded: Set<string>): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const node of nodes) {
    const currentModuleId = moduleId ?? node.id;
    rows.push({ node, depth, moduleId: currentModuleId });
    if (node.children?.length && expanded.has(node.id)) {
      rows.push(...flatten(node.children, depth + 1, currentModuleId, expanded));
    }
  }
  return rows;
}

const ROW_TINT_BY_DEPTH: Record<number, string> = {
  0: 'bg-[var(--surface-muted)]',
  1: 'bg-[var(--surface-muted)]/45',
};

const LABEL_CLASS_BY_DEPTH: Record<number, string> = {
  0: 'font-extrabold text-[var(--text-primary)]',
  1: 'font-bold text-[var(--text-secondary)]',
};

export function RightsPage() {
  const { roles } = useAdminData();
  const { showToast } = useToast();
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(RIGHTS_TREE.map((node) => node.id)));
  const [overrides, setOverrides] = useState<Record<string, Record<string, PermissionLevel>>>({});

  const selectedRole = roles.find((role) => role.id === roleId) ?? roles[0];

  const visibleTree = useMemo(() => {
    const scoped = moduleFilter === 'all' ? RIGHTS_TREE : RIGHTS_TREE.filter((node) => node.id === moduleFilter);
    return filterTree(scoped, search.trim().toLowerCase());
  }, [moduleFilter, search]);

  const effectiveExpanded = search.trim() ? new Set(ALL_RIGHTS_NODE_IDS) : expanded;
  const rows = useMemo(() => flatten(visibleTree, 0, null, effectiveExpanded), [visibleTree, effectiveExpanded]);

  const getPermission = (leafId: string, moduleId: string): PermissionLevel => {
    const explicit = overrides[roleId]?.[leafId];
    if (explicit) return explicit;
    const moduleOverride = ROLE_MODULE_OVERRIDES[roleId]?.[moduleId];
    if (moduleOverride) return moduleOverride;
    return ROLE_DEFAULT_LEVEL[roleId] ?? 'read-only';
  };

  const setPermission = (leafId: string, level: PermissionLevel) => {
    setOverrides((current) => ({
      ...current,
      [roleId]: { ...current[roleId], [leafId]: level },
    }));
  };

  /** The value shown/edited in a row's toggle — the leaf's own permission, or a same/mixed
   * rollup of every Activity beneath a Module/Feature row. */
  const getRowLevel = (node: RightsNode, moduleId: string): RollupLevel => {
    const leafIds = collectLeafIds(node);
    const levels = new Set(leafIds.map((id) => getPermission(id, moduleId)));
    return levels.size === 1 ? [...levels][0] : 'mixed';
  };

  const applyToRow = (node: RightsNode, level: PermissionLevel) => {
    const leafIds = collectLeafIds(node);
    setOverrides((current) => ({
      ...current,
      [roleId]: { ...current[roleId], ...Object.fromEntries(leafIds.map((id) => [id, level])) },
    }));
    if (leafIds.length > 1) showToast(`Set ${leafIds.length} activities under "${node.label}" to ${level.replace('-', ' ')} ✓`);
  };

  const toggleExpanded = (nodeId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const clearFilters = () => {
    setModuleFilter('all');
    setSearch('');
    showToast('Filters cleared');
  };

  const allLeafIds = useMemo(() => RIGHTS_TREE.flatMap(collectLeafIds), []);
  const summaryCounts = useMemo(() => {
    const counts: Record<PermissionLevel, number> = { 'read-only': 0, 'full-control': 0, deny: 0 };
    for (const leafId of allLeafIds) {
      const topModuleId = leafId.split('.')[0];
      counts[getPermission(leafId, topModuleId)] += 1;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recomputed intentionally whenever the role or its overrides change
  }, [allLeafIds, roleId, overrides]);

  if (!selectedRole) {
    return (
      <div className="admin-reveal flex flex-col gap-4">
        <PanelHeader title="Rights" />
        <EmptyState icon="🛡️" title="No roles yet" description="Add a role under User roles before configuring rights." />
      </div>
    );
  }

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Rights" subtitle={`${TOTAL_ACTIVITY_COUNT} activities across ${RIGHTS_TREE.length} modules`} />

      <div className="admin-panel-card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-48 shrink-0">
            <Dropdown
              label="Role" searchable={false} clearable={false}
              value={roleId}
              onValueChange={(value) => setRoleId(value ?? roleId)}
              options={roles.map((role) => ({ id: role.id, value: role.name }))}
              className="min-h-8"
            />
          </div>
          <div className="w-48 shrink-0">
            <Dropdown
              label="Module" searchable={false} clearable={false}
              value={moduleFilter}
              onValueChange={(value) => setModuleFilter(value ?? 'all')}
              options={[{ id: 'all', value: 'All Modules' }, ...RIGHTS_TREE.map((node) => ({ id: node.id, value: node.label }))]}
              className="min-h-8"
            />
          </div>
          <InputField
            label="Search modules, features and activities"
            hideLabel
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules, features, or activities…"
            className="min-h-8 text-xs placeholder:text-xs"
            wrapperClassName="max-w-xs flex-1"
          />
          <CommonButton variant="outline" iconLeft={<XCircle size={13} />} onClick={clearFilters}>Clear Filters</CommonButton>
          <div className="ml-auto flex items-center gap-1.5">
            <CommonButton variant="outline" onClick={() => setExpanded(new Set(ALL_RIGHTS_NODE_IDS))}>Expand All</CommonButton>
            <CommonButton variant="outline" onClick={() => setExpanded(new Set())}>Collapse All</CommonButton>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--line-soft)] pt-3 text-xs">
          <span className="font-bold text-[var(--text-secondary)]">Editing rights for {selectedRole.name}:</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-[var(--success)]"><span className="size-2 rounded-full bg-[var(--success)]" />{summaryCounts['full-control']} Full Control</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-[var(--info)]"><span className="size-2 rounded-full bg-[var(--info)]" />{summaryCounts['read-only']} Read Only</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-[var(--error)]"><span className="size-2 rounded-full bg-[var(--error)]" />{summaryCounts.deny} Deny</span>
          <span className="text-[var(--text-faint)]">Changes apply instantly for this session — this prototype does not persist permissions.</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🔍" title="No matches" description="Try a different search term or module filter." />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide">Module / Feature / Activity</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide">Description</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide">Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {rows.map(({ node, depth, moduleId }) => {
                const hasChildren = Boolean(node.children?.length);
                const isExpanded = effectiveExpanded.has(node.id);
                const rowLevel = getRowLevel(node, moduleId);
                return (
                  <tr key={node.id} className={ROW_TINT_BY_DEPTH[depth]}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 1.25}rem` }}>
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(node.id)}
                            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
                            className="grid size-5 shrink-0 place-items-center rounded text-[var(--text-secondary)] hover:bg-[var(--hover)]"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        ) : (
                          <span className="inline-block size-5 shrink-0" />
                        )}
                        <span className={LABEL_CLASS_BY_DEPTH[depth] ?? 'text-[var(--text-primary)]'}>{node.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">{node.description ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <PermissionToggle value={rowLevel} onChange={(level) => (hasChildren ? applyToRow(node, level) : setPermission(node.id, level))} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
