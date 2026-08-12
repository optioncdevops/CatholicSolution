import { useMemo, useState } from 'react';
import { BuildingIcon, SearchIcon } from '@shared/app/components/UiIcons';

const groups = [
  { name: 'All School Contacts', type: 'System', members: 2340, source: 'OptionC School', channels: ['Text', 'Email', 'Voicemail', 'Push'], lastUsed: 'Today, 10:42 AM' },
  { name: 'Students’ Parents & Staff', type: 'System', members: 2018, source: 'OptionC School', channels: ['Text', 'Email', 'Voicemail'], lastUsed: 'Yesterday' },
  { name: 'Students’ Parents Only', type: 'System', members: 1842, source: 'OptionC School', channels: ['Text', 'Email'], lastUsed: 'Aug 5' },
  { name: 'Staff Only', type: 'System', members: 176, source: 'OptionC School', channels: ['Text', 'Email', 'Voicemail'], lastUsed: 'Today, 8:14 AM' },
  { name: 'Transport Group', type: 'Custom', members: 318, source: 'ArcAlerts', channels: ['Text', 'Push'], lastUsed: 'Today, 8:14 AM' },
  { name: 'Grade 9 Families', type: 'Custom', members: 184, source: 'ArcAlerts', channels: ['Text', 'Email'], lastUsed: 'Aug 4' },
  { name: 'Parish Families', type: 'Integrated', members: 486, source: 'OptionC Parish', channels: ['Text', 'Email'], lastUsed: 'Yesterday' },
] as const;

export function ArcAlertsGroups() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const filtered = useMemo(() => groups.filter((group) => {
    const haystack = `${group.name} ${group.type} ${group.source} ${group.channels.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (type === 'All' || group.type === type);
  }), [query, type]);

  return (
    <div className="grid gap-4">
      <header className="arc-view-header">
        <div>
          <p className="arc-view-kicker">Directory</p>
          <h1>Groups</h1>
          <p>View the recipient groups available when composing ArcAlerts communications.</p>
        </div>
        <span className="arc-readonly-badge"><BuildingIcon size={14} /> Read only</span>
      </header>

      <section className="surface-card overflow-hidden">
        <div className="arc-directory-toolbar">
          <label className="arc-directory-search">
            <SearchIcon size={16} />
            <span className="sr-only">Search groups</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search group, source, or channel" />
          </label>
          <div className="arc-segmented" role="group" aria-label="Group type">
            {['All', 'System', 'Custom', 'Integrated'].map((item) => (
              <button key={item} type="button" onClick={() => setType(item)} className={type === item ? 'is-active' : ''}>{item}</button>
            ))}
          </div>
          <span className="arc-directory-count">{filtered.length} groups</span>
        </div>

        <div className="arc-group-grid">
          {filtered.map((group) => (
            <article key={group.name} className="arc-group-card">
              <div className="arc-group-card__head"><span className="arc-group-card__icon"><BuildingIcon size={18} /></span><div><strong>{group.name}</strong><span>{group.source}</span></div><span className="arc-type-badge">{group.type}</span></div>
              <div className="arc-group-card__stats"><div><span>Members</span><strong>{group.members.toLocaleString()}</strong></div><div><span>Last used</span><strong>{group.lastUsed}</strong></div></div>
              <div className="arc-token-list arc-token-list--channel">{group.channels.map((channel) => <span key={channel}>{channel}</span>)}</div>
            </article>
          ))}
          {filtered.length === 0 && <div className="arc-empty-state arc-empty-state--grid">No groups match the current search and filter.</div>}
        </div>
      </section>
    </div>
  );
}
