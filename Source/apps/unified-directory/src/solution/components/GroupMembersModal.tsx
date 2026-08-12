import { useMemo, useState, type FormEvent } from 'react';
import { SearchIcon, UsersIcon } from '@shared/app/components/UiIcons';
import type { DirectoryGroup, DirectoryUser } from './directoryData';
import { initials } from './directoryData';

export function GroupMembersModal({ group, users, onClose, onSave }: {
  group: DirectoryGroup;
  users: DirectoryUser[];
  onClose: () => void;
  onSave: (memberIds: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [...group.memberIds]);
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => users.filter((user) => !normalized || [user.name, user.email, ...user.applications].join(' ').toLowerCase().includes(normalized)), [normalized, users]);
  const toggle = (id: string) => setSelectedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave(selectedIds); };
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="directory-modal directory-modal--members">
        <div className="directory-modal__head"><div><span className="metric-label text-sky-700">Group membership</span><h2>{group.name}</h2><p>Add or remove directory users. Selections are preserved while you search.</p></div><button type="button" onClick={onClose} className="directory-modal__close" aria-label="Close">×</button></div>
        <div className="directory-member-search"><SearchIcon size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 100+ users" aria-label="Search users to add to group"/><span>{selectedIds.length} selected</span></div>
        <div className="directory-member-picker scrollbar-thin">
          {filtered.map((user) => <label key={user.id} className="directory-member-option"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggle(user.id)}/><span className="directory-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></label>)}
        </div>
        <div className="directory-modal__foot"><button type="button" onClick={onClose} className="action-secondary border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="action-primary bg-sky-700 text-white hover:bg-sky-800"><UsersIcon size={15}/> Save {selectedIds.length} members</button></div>
      </form>
    </div>
  );
}
