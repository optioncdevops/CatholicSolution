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
  const toggleVisible = () => { const visibleIds = visibleMembers.map((user) => user.id); setSelectedMemberIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]); };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={onSubmit} className={`directory-modal directory-modal--access ${userMode ? 'directory-modal--person' : 'directory-modal--group-create'}`}>
        <div className="directory-modal__head">
          <div><span className="metric-label text-sky-700">Unified Directory</span><h2>{userMode ? 'Add user' : 'Create group'}</h2><p>{userMode ? 'Create the member identity, contact methods, SaaS access, and group memberships in one workflow.' : 'Create a reusable directory group and optionally add members now.'}</p></div>
          <button type="button" onClick={onClose} className="directory-modal__close" aria-label="Close">×</button>
        </div>

        <div className="directory-modal__body directory-modal__body--scroll">
          {userMode ? (
            <>
              <div className="directory-form-grid"><Field name="name" label="Full name" placeholder="Full name"/><Field name="displayId" label="Member / employee ID" placeholder="Optional reference" required={false}/></div>
              <ContactMethods/>
              <CheckboxSection title="SaaS applications" description="New and edited user provisioning is currently available only for Matt Money and ArcAlerts. Additional SaaS products can be enabled later." name="applications" options={applications}/>
              <CheckboxSection title="Groups" description="Assign one or more existing Unified Directory groups." name="groups" options={groups.map((group) => group.name)}/>
            </>
          ) : (
            <>
              <div className="directory-form-grid"><Field name="name" label="Group name" placeholder="Group name"/><Field name="description" label="Description" placeholder="What is this group used for?"/></div>
              <fieldset className="directory-group-members-section">
                <legend>Available users</legend>
                <div className="directory-group-members-head"><div><strong>Add users to this group</strong><span>{activeUsers.length} active users available. Membership can be changed later.</span></div><span className="directory-selection-count">{selectedCount} selected</span></div>
                <div className="directory-group-member-toolbar"><label className="directory-inline-search"><SearchIcon size={15}/><input value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Search name, email, app, or group" aria-label="Search available users"/></label><button type="button" onClick={toggleVisible}>{allVisibleSelected ? 'Clear visible' : 'Select visible'}</button></div>
                <div className="directory-group-member-list" role="group" aria-label="Available users for new group">{visibleMembers.length ? visibleMembers.map((user) => { const checked = selectedMemberIds.includes(user.id); return <label key={user.id} className={`directory-group-member-row ${checked ? 'is-selected' : ''}`}><input type="checkbox" checked={checked} onChange={() => toggleMember(user.id)}/><span className="directory-avatar">{initials(user.name)}</span><span className="directory-group-member-copy"><strong>{user.name}</strong><small>{user.email}</small><em>{user.groups.slice(0,2).join(' / ') || 'No group membership'}</em></span></label>; }) : <div className="directory-group-member-empty">No active users match your search.</div>}</div>
                {selectedMemberIds.map((id) => <input key={id} type="hidden" name="memberIds" value={id}/>) }
              </fieldset>
            </>
          )}
        </div>

        <div className="directory-modal__foot">{!userMode ? <span className="directory-create-summary">{selectedCount ? `${selectedCount} user${selectedCount === 1 ? '' : 's'} will be added` : 'You can create an empty group and add users later'}</span> : <span className="directory-create-summary">Contact details can be updated later from the member record.</span>}<button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="action-primary bg-sky-700 text-white hover:bg-sky-800">{userMode ? <UserPlusIcon size={15}/> : <UsersIcon size={15}/>} {userMode ? 'Add user' : 'Create group'}</button></div>
      </form>
    </div>
  );
}

function ContactMethods() {
  return (
    <div className="directory-contact-methods">
      <fieldset className="directory-contact-section"><legend>User Telephone Numbers</legend><div className="directory-contact-grid directory-contact-grid--phones"><span>Type</span><span>Number</span><span>Unlisted?</span><span>Primary?</span>{(['Home','Work','Mobile'] as const).map((type) => <div className="contents" key={type}><strong>{type}</strong><div className="directory-phone-entry"><input name={`phone_${type.toLowerCase()}`} placeholder={type === 'Work' ? '(000) 000-0000' : type}/>{type === 'Work' ? <input name="phone_work_ext" placeholder="Ext" className="directory-extension-input"/> : null}</div><label className="directory-contact-check"><input type="checkbox" name={`phone_${type.toLowerCase()}_unlisted`}/><span className="sr-only">{type} unlisted</span></label><label className="directory-contact-check"><input type="radio" name="phone_primary" value={type} defaultChecked={type === 'Home'}/><span className="sr-only">Primary {type} phone</span></label></div>)}</div></fieldset>
      <fieldset className="directory-contact-section"><legend>User E-Mail Addresses</legend><div className="directory-contact-grid directory-contact-grid--emails"><span>Type</span><span>User E-Mail Address</span><span>Primary?</span>{(['Home','Work','Organization'] as const).map((type) => <div className="contents" key={type}><strong>{type}</strong><input type="email" name={`email_${type.toLowerCase()}`} placeholder={type === 'Work' ? 'name@organization.org' : `${type} email`} required={type === 'Work'}/><label className="directory-contact-check"><input type="radio" name="email_primary" value={type} defaultChecked={type === 'Work'}/><span className="sr-only">Primary {type} email</span></label></div>)}</div></fieldset>
    </div>
  );
}

function Field({ name, label, placeholder, type = 'text', required = true }: { name: string; label: string; placeholder: string; type?: string; required?: boolean }) { return <label className="directory-field">{label}<input name={name} type={type} required={required} placeholder={placeholder}/></label>; }
function CheckboxSection({ title, description, name, options }: { title: string; description: string; name: string; options: readonly string[] }) { return <fieldset className="directory-choice-section"><legend>{title}</legend><p>{description}</p><div className="directory-choice-grid">{options.map((option) => <label key={option}><input type="checkbox" name={name} value={option}/><span>{option}</span></label>)}</div></fieldset>; }
