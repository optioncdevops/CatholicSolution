import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { Button } from '../components/form/Button';
import { FilterSelect } from '../components/form/SelectField';
import { CONTROL_BASE, CONTROL_HEIGHT } from '../components/form/controlStyles';
import { ALL_RIGHTS_NODE_IDS, RIGHTS_TREE, type RightsNode } from './rightsTree';
import type { PermissionLevel } from '../types';

const PERMISSION_LEVELS: Array<{ id: PermissionLevel; label: string }> = [
  { id: 'read-only', label: 'ReadOnly' },
  { id: 'full-control', label: 'FullControl' },
  { id: 'deny', label: 'Deny' },
];

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

  const getPermission = (nodeId: string, moduleId: string): PermissionLevel => {
    const explicit = overrides[roleId]?.[nodeId];
    if (explicit) return explicit;
    const moduleOverride = ROLE_MODULE_OVERRIDES[roleId]?.[moduleId];
    if (moduleOverride) return moduleOverride;
    return ROLE_DEFAULT_LEVEL[roleId] ?? 'read-only';
  };

  const setPermission = (nodeId: string, level: PermissionLevel) => {
    setOverrides((current) => ({
      ...current,
      [roleId]: { ...current[roleId], [nodeId]: level },
    }));
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

  if (!selectedRole) {
    return (
      <div className="admin-reveal flex flex-col gap-4">
        <PanelHeader title="Rights" description="Grant or revoke permissions per role and module." />
        <EmptyState icon="🛡️" title="No roles yet" description="Add a role under User roles before configuring rights." />
      </div>
    );
  }

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Rights" description="Grant or revoke permissions per role, module, and feature." />

      <div className="admin-panel-card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect label="Role" value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </FilterSelect>
          <FilterSelect label="Module" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
            <option value="all">All modules</option>
            {RIGHTS_TREE.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}
          </FilterSelect>
          <Button variant="secondary" icon={<XCircle size={13} />} onClick={clearFilters}>Clear filters</Button>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="secondary" onClick={() => setExpanded(new Set(ALL_RIGHTS_NODE_IDS))}>Expand all</Button>
            <Button variant="secondary" onClick={() => setExpanded(new Set())}>Collapse all</Button>
          </div>
        </div>
        <label className="relative max-w-sm">
          <span className="sr-only">Search modules and features</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules, submodules, or features…"
            className={`${CONTROL_BASE} ${CONTROL_HEIGHT} text-[length:var(--admin-text-xs)]`}
          />
        </label>
      </div>

      <p className="text-xs text-[var(--text-faint)]">
        Editing rights for <span className="font-bold text-[var(--text-secondary)]">{selectedRole.name}</span>. Changes apply instantly for this session — this prototype does not persist permissions.
      </p>

      {rows.length === 0 ? (
        <EmptyState icon="🔍" title="No matches" description="Try a different search term or module filter." />
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-muted)]">
                <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Module / feature</th>
                <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Description</th>
                {PERMISSION_LEVELS.map((level) => (
                  <th key={level.id} className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{level.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-soft)]">
              {rows.map(({ node, depth, moduleId }) => {
                const hasChildren = Boolean(node.children?.length);
                const isExpanded = effectiveExpanded.has(node.id);
                const level = getPermission(node.id, moduleId);
                return (
                  <tr key={node.id} className={depth === 0 ? 'bg-[var(--surface-muted)]/50' : undefined}>
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
                        <span className={depth === 0 ? 'font-extrabold text-[var(--text-primary)]' : 'font-bold text-[var(--text-secondary)]'}>{node.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">{node.description ?? '—'}</td>
                    {PERMISSION_LEVELS.map((option) => (
                      <td key={option.id} className="px-3 py-2.5 text-center">
                        <input
                          type="radio"
                          name={`permission-${node.id}`}
                          checked={level === option.id}
                          onChange={() => setPermission(node.id, option.id)}
                          aria-label={`${option.label} for ${node.label}`}
                          className="size-3.5 accent-[var(--primary)]"
                        />
                      </td>
                    ))}
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
