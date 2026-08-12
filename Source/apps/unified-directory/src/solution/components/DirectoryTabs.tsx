import { UsersIcon } from '@shared/app/components/UiIcons';

export type DirectoryTab = 'Active User' | 'Inactive Users' | 'Groups';

export function DirectoryTabs({ tab, onChange, activeUsers, inactiveUsers, groups }: {
  tab: DirectoryTab;
  onChange: (tab: DirectoryTab) => void;
  activeUsers: number;
  inactiveUsers: number;
  groups: number;
}) {
  return (
    <div className="directory-tabs" role="tablist" aria-label="Directory sections">
      <TabButton active={tab === 'Active User'} label="Active User" count={activeUsers} onClick={() => onChange('Active User')} />
      <TabButton active={tab === 'Inactive Users'} label="Inactive Users" count={inactiveUsers} onClick={() => onChange('Inactive Users')} />
      <TabButton active={tab === 'Groups'} label="Groups" count={groups} onClick={() => onChange('Groups')} />
    </div>
  );
}

function TabButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`directory-tab ${active ? 'directory-tab--active' : ''}`}>
      <span className="directory-tab__icon"><UsersIcon size={17} /></span>
      <span>{label}</span>
      <span className="directory-tab__count">{count}</span>
    </button>
  );
}
