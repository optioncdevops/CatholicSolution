import { useMemo, useState, type FormEvent } from 'react';
import { SearchIcon, UserPlusIcon, UsersIcon } from '@shared/app/components/UiIcons';
import type { DirectoryGroup, DirectoryUser } from './directoryData';
import { initials } from './directoryData';

export function DirectoryModal({ mode, groups, applications, users, onClose, onSubmit }: {
  mode: 'user' | 'group';
  groups: DirectoryGroup[];
  applications: readonly string[];
  users: DirectoryUser[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const userMode = mode === 'user';
  const activeUsers = useMemo(() => users.filter((user) => user.active), [users]);
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const normalized = memberQuery.trim().toLowerCase();
  const visibleMembers = useMemo(() => activeUsers.filter((user) => !normalized || [user.name, user.email, ...user.applications, ...user.groups].join(' ').toLowerCase().includes(normalized)), [activeUsers, normalized]);
  const selectedCount = selectedMemberIds.length;
  const allVisibleSelected = visibleMembers.length > 0 && visibleMembers.every((user) => selectedMemberIds.includes(user.id));

  const toggleMember = (id: string) => setSelectedMemberIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleVisible = () => {
    const visibleIds = visibleMembers.map((user) => user.id);
    setSelectedMemberIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={onSubmit} className={`directory-modal directory-modal--access ${userMode ? '' : 'directory-modal--group-create'}`}>
        <div className="directory-modal__head">
          <div><span className="metric-label text-sky-700">Unified Directory</span><h2>{userMode ? 'Add user' : 'Create group'}</h2><p>{userMode ? 'Create an identity, choose the currently supported SaaS applications, and assign initial groups.' : 'Define the group, connect applications, and add available users before you create it.'}</p></div>
          <button type="button" onClick={onClose} className="directory-modal__close" aria-label="Close">x</button>
        </div>

        <div className="directory-modal__body directory-modal__body--scroll">
          <div className="directory-form-grid">
            <Field name="name" label={userMode ? 'Full name' : 'Group name'} placeholder={userMode ? 'Full name' : 'Group name'} />
            {userMode ? <Field name="email" label="Work email" placeholder="name@organization.org" type="email" /> : <Field name="description" label="Description" placeholder="What is this group used for?" />}
          </div>
          {userMode ? <Field name="phone" label="Phone" placeholder="+1 (215) 555-0100" required={false} /> : null}

          <CheckboxSection
            title="SaaS applications"
            description={userMode ? 'For this phase, new-user access is available for Matt Money and ArcAlerts. Additional applications can be enabled later.' : 'Select the applications this access group is intended to support.'}
            name="applications"
            options={applications}
          />

          {userMode ? (
            <CheckboxSection title="Groups" description="Assign one or more existing groups now; membership can be changed later." name="groups" options={groups.map((group) => group.name)} />
          ) : (
            <fieldset className="directory-group-members-section">
              <legend>Available users</legend>
              <div className="directory-group-members-head">
                <div><strong>Add users to this group</strong><span>{activeUsers.length} active users available. Membership can be changed later.</span></div>
                <span className="directory-selection-count">{selectedCount} selected</span>
              </div>
              <div className="directory-group-member-toolbar">
                <label className="directory-inline-search"><SearchIcon size={15}/><input value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Search name, email, app, or group" aria-label="Search available users" /></label>
                <button type="button" onClick={toggleVisible}>{allVisibleSelected ? 'Clear visible' : 'Select visible'}</button>
              </div>
              <div className="directory-group-member-list" role="group" aria-label="Available users for new group">
                {visibleMembers.length ? visibleMembers.map((user) => {
                  const checked = selectedMemberIds.includes(user.id);
                  return (
                    <label key={user.id} className={`directory-group-member-row ${checked ? 'is-selected' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleMember(user.id)} />
                      <span className="directory-avatar">{initials(user.name)}</span>
                      <span className="directory-group-member-copy"><strong>{user.name}</strong><small>{user.email}</small><em>{user.applications.slice(0, 2).join(' / ') || 'No app access'}</em></span>
                    </label>
                  );
                }) : <div className="directory-group-member-empty">No active users match your search.</div>}
              </div>
              {selectedMemberIds.map((id) => <input key={id} type="hidden" name="memberIds" value={id} />)}
            </fieldset>
          )}
        </div>

        <div className="directory-modal__foot">
          {!userMode ? <span className="directory-create-summary">{selectedCount ? `${selectedCount} user${selectedCount === 1 ? '' : 's'} will be added` : 'You can create an empty group and add users later'}</span> : null}
          <button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="action-primary bg-sky-700 text-white hover:bg-sky-800">{userMode ? <UserPlusIcon size={15}/> : <UsersIcon size={15}/>} {userMode ? 'Add user' : 'Create group'}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, placeholder, type = 'text', required = true }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) {
  return <label className="directory-field">{label}<input name={name} type={type} required={required} placeholder={placeholder} /></label>;
}

function CheckboxSection({ title, description, name, options }: { title: string; description: string; name: string; options: readonly string[] }) {
  return <fieldset className="directory-choice-section"><legend>{title}</legend><p>{description}</p><div className="directory-choice-grid">{options.map((option) => <label key={option}><input type="checkbox" name={name} value={option}/><span>{option}</span></label>)}</div></fieldset>;
}
