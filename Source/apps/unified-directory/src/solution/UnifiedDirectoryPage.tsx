import { useMemo, useState, type FormEvent } from 'react';
import { PlusIcon, UserPlusIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { KpiCard } from '@shared/app/components/KpiCard';
import { DirectoryTabs, type DirectoryTab } from '@/solution/components/DirectoryTabs';
import { DirectoryModal } from '@/solution/components/DirectoryModal';
import { GroupWorkspace, UserWorkspace } from '@/solution/components/DirectoryWorkspace';
import { initialGroups, initialUsers, type DirectoryGroup, type DirectoryUser, type UserStatus } from '@/solution/components/directoryData';

const app = getAppById('unified-directory')!;

export function UnifiedDirectoryPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<DirectoryTab>('Users');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | UserStatus>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [users, setUsers] = useState<DirectoryUser[]>(() => initialUsers.map((item) => ({ ...item, groups: [...item.groups] })));
  const [groups, setGroups] = useState<DirectoryGroup[]>(() => initialGroups.map((item) => ({ ...item, apps: [...item.apps] })));
  const [selectedUser, setSelectedUser] = useState(initialUsers[0].id);
  const [selectedGroup, setSelectedGroup] = useState(initialGroups[0].id);

  const normalized = query.trim().toLowerCase();
  const filteredUsers = useMemo(() => users.filter((item) => {
    const matchesText = [item.name, item.email, item.role, item.source, ...item.groups].join(' ').toLowerCase().includes(normalized);
    return matchesText && (status === 'All' || item.status === status);
  }), [users, normalized, status]);
  const filteredGroups = useMemo(() => groups.filter((item) => [item.name, item.type, item.owner, item.description, ...item.apps].join(' ').toLowerCase().includes(normalized)), [groups, normalized]);

  const changeTab = (next: DirectoryTab) => { setTab(next); setQuery(''); setStatus('All'); };
  const addRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    if (!name) return;
    if (tab === 'Users') {
      const email = String(form.get('email') || '').trim();
      const role = String(form.get('role') || 'Member');
      const user: DirectoryUser = { id: `u${Date.now()}`, name, email, role, groups: ['General'], status: 'Invited', lastActive: 'Invitation just sent', source: 'Manual invite' };
      setUsers((items) => [...items, user]); setSelectedUser(user.id); showToast(`${name} invited to Unified Directory ✓`);
    } else {
      const group: DirectoryGroup = { id: `g${Date.now()}`, name, type: String(form.get('groupType') || 'Organization group'), members: 0, owner: 'Carl Lapp', apps: ['Unified Directory'], description: String(form.get('description') || 'Organization membership group.') };
      setGroups((items) => [...items, group]); setSelectedGroup(group.id); showToast(`${name} group created ✓`);
    }
    setShowAdd(false); event.currentTarget.reset();
  };

  const activeCount = users.filter((user) => user.status === 'Active').length;
  const invitedCount = users.filter((user) => user.status === 'Invited').length;

  return (
    <AppLayout app={app} className="bg-[#f4f6fa]">
      <main className="dashboard-content dashboard-stack">
        <DashboardHeader eyebrow="Identity & access" title="Unified Directory" status={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Directory healthy</span>} actions={<button type="button" onClick={() => setShowAdd(true)} className="action-primary bg-sky-700 text-white hover:bg-sky-800">{tab === 'Users' ? <UserPlusIcon size={15}/> : <PlusIcon size={15}/>} {tab === 'Users' ? 'Invite user' : 'Create group'}</button>} />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Active users" value={String(activeCount)} detail={`${users.length} total directory identities`} icon="👤" accentClass="bg-sky-500" />
          <KpiCard label="Groups" value={String(groups.length)} detail="Reusable organization memberships" icon="👥" accentClass="bg-indigo-500" />
          <KpiCard label="Pending invites" value={String(invitedCount)} detail="Awaiting first account activation" icon="✉️" accentClass="bg-amber-500" />
          <KpiCard label="Directory health" value="100%" detail="No duplicate identities detected" icon="✓" accentClass="bg-emerald-500" />
        </section>

        <section className="directory-shell">
          <DirectoryTabs tab={tab} onChange={changeTab} users={users.length} groups={groups.length} />
          {tab === 'Users' ? <UserWorkspace users={filteredUsers} query={query} status={status} onQuery={setQuery} onStatus={setStatus} selectedId={selectedUser} onSelect={setSelectedUser} onAction={showToast} /> : <GroupWorkspace groups={filteredGroups} query={query} onQuery={setQuery} selectedId={selectedGroup} onSelect={setSelectedGroup} onAction={showToast} />}
        </section>
      </main>
      {showAdd ? <DirectoryModal tab={tab} onClose={() => setShowAdd(false)} onSubmit={addRecord} /> : null}
    </AppLayout>
  );
}
