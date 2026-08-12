import type { FormEvent } from 'react';
import { UserPlusIcon, UsersIcon } from '@shared/app/components/UiIcons';
import type { DirectoryTab } from './DirectoryTabs';

export function DirectoryModal({ tab, onClose, onSubmit }: { tab: DirectoryTab; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const userMode = tab === 'Users';
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={onSubmit} className="directory-modal">
        <div className="directory-modal__head"><div><span className="metric-label text-sky-700">Unified Directory</span><h2>{userMode ? 'Invite user' : 'Create group'}</h2><p>{userMode ? 'Create an organization identity and assign initial access.' : 'Create a reusable membership group for connected applications.'}</p></div><button type="button" onClick={onClose} className="directory-modal__close" aria-label="Close">×</button></div>
        <div className="directory-modal__body">
          <Field name="name" label={userMode ? 'Full name' : 'Group name'} placeholder={userMode ? 'Full name' : 'Group name'} />
          {userMode ? <><Field name="email" label="Work email" placeholder="name@organization.org" type="email" /><label className="directory-field">Initial role<select name="role" defaultValue="Member"><option>Member</option><option>Teacher</option><option>Parish Staff</option><option>Volunteer Coordinator</option><option>Finance Staff</option><option>Administrator</option></select></label></> : <><label className="directory-field">Group type<select name="groupType" defaultValue="Organization group"><option>Organization group</option><option>Security group</option><option>Program group</option></select></label><Field name="description" label="Description" placeholder="What is this group used for?" /></>}
        </div>
        <div className="directory-modal__foot"><button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="action-primary bg-sky-700 text-white hover:bg-sky-800">{userMode ? <UserPlusIcon size={15}/> : <UsersIcon size={15}/>} {userMode ? 'Send invitation' : 'Create group'}</button></div>
      </form>
    </div>
  );
}

function Field({ name, label, placeholder, type = 'text' }: { name: string; label: string; placeholder: string; type?: string }) {
  return <label className="directory-field">{label}<input name={name} type={type} required placeholder={placeholder} /></label>;
}
