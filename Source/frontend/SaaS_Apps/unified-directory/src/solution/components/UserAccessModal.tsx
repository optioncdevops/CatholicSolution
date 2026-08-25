import { useState, type FormEvent } from 'react';
import { UsersIcon } from '@shared/app/components/UiIcons';
import type { DirectoryGroup, DirectoryUser } from './directoryData';

export function UserAccessModal({ user, groups, applications, onClose, onSave }: {
  user: DirectoryUser;
  groups: DirectoryGroup[];
  applications: string[];
  onClose: () => void;
  onSave: (applications: string[], groups: string[]) => void;
}) {
  const [selectedApps, setSelectedApps] = useState<string[]>(() => user.applications.filter((item) => applications.includes(item)));
  const [selectedGroups, setSelectedGroups] = useState<string[]>(() => [...user.groups]);
  const toggle = (items: string[], setItems: (items: string[]) => void, value: string) => setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (selectedApps.length) onSave(selectedApps, selectedGroups); };
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="directory-modal directory-modal--access">
        <div className="directory-modal__head"><div><span className="metric-label text-sky-700">Manage user access</span><h2>{user.name}</h2><p>Keep application access and group membership together so the identity stays easy to review.</p></div><button type="button" onClick={onClose} className="directory-modal__close" aria-label="Close">×</button></div>
        <div className="directory-modal__body directory-modal__body--scroll">
          <Choice title="SaaS applications" description="Matt Money and ArcAlerts are the currently supported SaaS assignments. Select at least one." options={applications} selected={selectedApps} onToggle={(value) => toggle(selectedApps, setSelectedApps, value)}/>
          <Choice title="Groups" description="Group membership can be changed here or from the Groups tab." options={groups.map((group) => group.name)} selected={selectedGroups} onToggle={(value) => toggle(selectedGroups, setSelectedGroups, value)}/>
        </div>
        <div className="directory-modal__foot"><span className="directory-access-summary">{selectedApps.length} apps · {selectedGroups.length} groups</span><button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={!selectedApps.length} className="action-primary bg-sky-700 text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"><UsersIcon size={15}/> Save access</button></div>
      </form>
    </div>
  );
}

function Choice({ title, description, options, selected, onToggle }: { title: string; description: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <fieldset className="directory-choice-section"><legend>{title}</legend><p>{description}</p><div className="directory-choice-grid">{options.map((option) => <label key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)}/><span>{option}</span></label>)}</div></fieldset>;
}
