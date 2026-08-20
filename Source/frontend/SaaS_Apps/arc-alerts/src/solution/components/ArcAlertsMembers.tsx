import { useMemo, useState } from 'react';
import { SearchIcon, UsersIcon } from '@shared/app/components/UiIcons';

const members = [
  { name: 'Maria Rodriguez', type: 'Parent', email: 'maria.rodriguez@example.org', phone: '(555) 214-2190', groups: ['Students’ Parents & Staff', 'Grade 9 Families'], channels: ['Text', 'Email'], status: 'Active' },
  { name: 'Daniel Kim', type: 'Staff', email: 'daniel.kim@stmarys.org', phone: '(555) 214-2281', groups: ['Staff Only', 'All School Contacts'], channels: ['Text', 'Email', 'Voicemail'], status: 'Active' },
  { name: 'Sarah Thompson', type: 'Parent', email: 'sarah.thompson@example.org', phone: '(555) 214-2307', groups: ['Students’ Parents Only', 'Transport Group'], channels: ['Text', 'Email'], status: 'Active' },
  { name: 'Michael O’Brien', type: 'Staff', email: 'mobrien@stmarys.org', phone: '(555) 214-2402', groups: ['Staff Only'], channels: ['Text', 'Voicemail'], status: 'Active' },
  { name: 'Jennifer Patel', type: 'Parent', email: 'jennifer.patel@example.org', phone: '(555) 214-2488', groups: ['Students’ Parents Only', 'Grade 6 Families'], channels: ['Email'], status: 'Active' },
  { name: 'Thomas Garcia', type: 'Parent', email: 'thomas.garcia@example.org', phone: '(555) 214-2544', groups: ['Students’ Parents & Staff'], channels: ['Text', 'Email'], status: 'Inactive' },
] as const;

export function ArcAlertsMembers() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const filtered = useMemo(() => members.filter((member) => {
    const haystack = `${member.name} ${member.email} ${member.phone} ${member.type} ${member.groups.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (type === 'All' || member.type === type);
  }), [query, type]);

  return (
    <div className="grid gap-4">
      <header className="arc-view-header">
        <div>
          <p className="arc-view-kicker">Directory</p>
          <h1>Members</h1>
          <p>View the contacts currently available to ArcAlerts recipient groups.</p>
        </div>
        <span className="arc-readonly-badge"><UsersIcon size={14} /> Read only</span>
      </header>

      <section className="surface-card overflow-hidden">
        <div className="arc-directory-toolbar">
          <label className="arc-directory-search">
            <SearchIcon size={16} />
            <span className="sr-only">Search members</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone, or group" />
          </label>
          <div className="arc-segmented" role="group" aria-label="Member type">
            {['All', 'Parent', 'Staff'].map((item) => (
              <button key={item} type="button" onClick={() => setType(item)} className={type === item ? 'is-active' : ''}>{item}</button>
            ))}
          </div>
          <span className="arc-directory-count">{filtered.length} shown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="arc-directory-table">
            <thead><tr><th>Member</th><th>Type</th><th>Groups</th><th>Channels</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.email}>
                  <td>
                    <div className="arc-member-cell"><span className="arc-member-avatar">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{member.name}</strong><span>{member.email}</span><small>{member.phone}</small></div></div>
                  </td>
                  <td><span className="arc-type-badge">{member.type}</span></td>
                  <td><div className="arc-token-list">{member.groups.map((group) => <span key={group}>{group}</span>)}</div></td>
                  <td><div className="arc-token-list arc-token-list--channel">{member.channels.map((channel) => <span key={channel}>{channel}</span>)}</div></td>
                  <td><span className={`arc-status-dot ${member.status === 'Active' ? 'is-active' : ''}`}>{member.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="arc-empty-state">No members match the current search and filter.</div>}
        </div>
      </section>
    </div>
  );
}
