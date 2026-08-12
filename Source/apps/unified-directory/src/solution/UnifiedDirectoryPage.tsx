import { useMemo, useState, type FormEvent } from 'react';
import { PlusIcon, UserPlusIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { DirectoryTabs, type DirectoryTab } from '@/solution/components/DirectoryTabs';
import { DirectoryModal } from '@/solution/components/DirectoryModal';
import { GroupMembersModal } from '@/solution/components/GroupMembersModal';
import { UserAccessModal } from '@/solution/components/UserAccessModal';
import { GroupWorkspace, UserWorkspace } from '@/solution/components/DirectoryWorkspace';
import { directoryApplications, initialGroups, initialUsers, userAssignableApplications, type DirectoryGroup, type DirectoryUser } from '@/solution/components/directoryData';

const app = getAppById('unified-directory')!;

export function UnifiedDirectoryPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<DirectoryTab>('Active User');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<'user' | 'group' | null>(null);
  const [memberGroupId, setMemberGroupId] = useState<string | null>(null);
  const [accessUserId, setAccessUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<DirectoryUser[]>(() => initialUsers.map((item) => ({ ...item, applications: [...item.applications], groups: [...item.groups] })));
  const [groups, setGroups] = useState<DirectoryGroup[]>(() => initialGroups.map((item) => ({ ...item, apps: [...item.apps], memberIds: [...item.memberIds] })));
  const [selectedUser, setSelectedUser] = useState(initialUsers.find((item) => item.active)?.id);
  const [selectedGroup, setSelectedGroup] = useState(initialGroups[0]?.id);

  const normalized = query.trim().toLowerCase();
  const activeUsers = users.filter((user) => user.active);
  const inactiveUsers = users.filter((user) => !user.active);
  const visibleUsers = tab === 'Inactive Users' ? inactiveUsers : activeUsers;
  const filteredUsers = useMemo(() => visibleUsers.filter((item) => !normalized || [item.name, item.email, item.source, ...item.applications, ...item.groups].join(' ').toLowerCase().includes(normalized)), [visibleUsers, normalized]);
  const filteredGroups = useMemo(() => groups.filter((item) => !normalized || [item.name, item.owner, item.description, ...item.apps].join(' ').toLowerCase().includes(normalized)), [groups, normalized]);
  const memberGroup = groups.find((group) => group.id === memberGroupId);
  const accessUser = users.find((user) => user.id === accessUserId);

  const changeTab = (next: DirectoryTab) => { setTab(next); setQuery(''); };
  const addRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    if (!name || !modal) return;
    if (modal === 'user') {
      const applications = form.getAll('applications').map(String);
      const selectedGroups = form.getAll('groups').map(String);
      const email = String(form.get('email') || '').trim();
      if (!applications.length) { showToast('Select at least one SaaS application'); return; }
      const user: DirectoryUser = { id: `u${Date.now()}`, name, email, phone: String(form.get('phone') || ''), applications, groups: selectedGroups, active: true, lastActive: 'Added just now', source: applications[0] };
      setUsers((items) => [...items, user]);
      setGroups((items) => items.map((group) => selectedGroups.includes(group.name) ? { ...group, memberIds: [...new Set([...group.memberIds, user.id])] } : group));
      setTab('Active User'); setSelectedUser(user.id); showToast(`${name} added to Unified Directory ✓`);
    } else {
      if (groups.some((group) => group.name.toLowerCase() === name.toLowerCase())) { showToast('A group with that name already exists'); return; }
      const applications = form.getAll('applications').map(String);
      const memberIds = form.getAll('memberIds').map(String);
      const group: DirectoryGroup = { id: `g${Date.now()}`, name, memberIds, owner: 'Carl Lapp', apps: applications, description: String(form.get('description') || 'Organization access group.') };
      setGroups((items) => [...items, group]);
      if (memberIds.length) setUsers((items) => items.map((user) => memberIds.includes(user.id) ? { ...user, groups: [...new Set([...user.groups, name])] } : user));
      setTab('Groups'); setSelectedGroup(group.id); showToast(`${name} group created with ${memberIds.length} member${memberIds.length === 1 ? '' : 's'} ✓`);
    }
    setModal(null); event.currentTarget.reset();
  };

  const saveGroupMembers = (selectedIds: string[]) => {
    if (!memberGroup) return;
    setGroups((items) => items.map((group) => group.id === memberGroup.id ? { ...group, memberIds: selectedIds } : group));
    setUsers((items) => items.map((user) => {
      const shouldBelong = selectedIds.includes(user.id);
      const alreadyBelongs = user.groups.includes(memberGroup.name);
      if (shouldBelong === alreadyBelongs) return user;
      return { ...user, groups: shouldBelong ? [...user.groups, memberGroup.name] : user.groups.filter((name) => name !== memberGroup.name) };
    }));
    showToast(`${memberGroup.name} membership updated ✓`); setMemberGroupId(null);
  };

  const saveUserAccess = (applications: string[], selectedGroups: string[]) => {
    if (!accessUser || !applications.length) return;
    setUsers((items) => items.map((user) => user.id === accessUser.id ? { ...user, applications, groups: selectedGroups, source: applications[0] } : user));
    setGroups((items) => items.map((group) => {
      const shouldBelong = selectedGroups.includes(group.name);
      const alreadyBelongs = group.memberIds.includes(accessUser.id);
      if (shouldBelong === alreadyBelongs) return group;
      return { ...group, memberIds: shouldBelong ? [...group.memberIds, accessUser.id] : group.memberIds.filter((id) => id !== accessUser.id) };
    }));
    showToast(`${accessUser.name} access updated ✓`); setAccessUserId(null);
  };

  const toggleUserActive = (id: string) => {
    const current = users.find((user) => user.id === id);
    if (!current) return;
    setUsers((items) => items.map((user) => user.id === id ? { ...user, active: !user.active, lastActive: user.active ? 'Deactivated just now' : 'Reactivated just now' } : user));
    setTab(current.active ? 'Inactive Users' : 'Active User');
    showToast(`${current.name} ${current.active ? 'moved to Inactive Users' : 'reactivated'} ✓`);
  };

  const addMode = tab === 'Groups' ? 'group' : 'user';
  return (
    <AppLayout app={app} className="bg-[#f4f6fa]">
      <main className="dashboard-content dashboard-stack directory-page">
        <DashboardHeader eyebrow="Identity & access" title="Unified Directory" status={<span className="directory-header-count">{users.length} users · {groups.length} groups</span>} actions={<button type="button" onClick={() => setModal(addMode)} className="action-primary bg-sky-700 text-white hover:bg-sky-800">{addMode === 'user' ? <UserPlusIcon size={15}/> : <PlusIcon size={15}/>} {addMode === 'user' ? 'Add user' : 'Create group'}</button>} />
        <section className="directory-shell">
          <DirectoryTabs tab={tab} onChange={changeTab} activeUsers={activeUsers.length} inactiveUsers={inactiveUsers.length} groups={groups.length}/>
          {tab === 'Groups'
            ? <GroupWorkspace groups={filteredGroups} users={users} query={query} onQuery={setQuery} selectedId={selectedGroup} onSelect={setSelectedGroup} onManageMembers={(group) => setMemberGroupId(group.id)} onAction={showToast}/>
            : <UserWorkspace users={filteredUsers} query={query} onQuery={setQuery} selectedId={selectedUser} onSelect={setSelectedUser} onManageAccess={(user) => setAccessUserId(user.id)} onToggleActive={toggleUserActive} onAction={showToast}/>
          }
        </section>
      </main>
      {modal ? <DirectoryModal mode={modal} groups={groups} users={users} applications={modal === 'user' ? userAssignableApplications : directoryApplications} onClose={() => setModal(null)} onSubmit={addRecord}/> : null}
      {memberGroup ? <GroupMembersModal group={memberGroup} users={users} onClose={() => setMemberGroupId(null)} onSave={saveGroupMembers}/> : null}
      {accessUser ? <UserAccessModal user={accessUser} groups={groups} applications={directoryApplications} onClose={() => setAccessUserId(null)} onSave={saveUserAccess}/> : null}
    </AppLayout>
  );
}
