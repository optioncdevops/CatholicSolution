import { useMemo, useState, type ReactNode } from 'react';
import { SearchIcon } from '@shared/app/components/UiIcons';
import { resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';
import type { DirectoryGroup, DirectoryUser } from './directoryData';
import { initials } from './directoryData';

export function UserWorkspace({ users, query, selectedId, onQuery, onSelect, onManageAccess, onToggleActive, onAction, groupOptions, applicationOptions }: {
  users: DirectoryUser[];
  query: string;
  selectedId?: string;
  onQuery: (value: string) => void;
  onSelect: (id: string) => void;
  onManageAccess: (user: DirectoryUser) => void;
  onToggleActive: (id: string) => void;
  onAction: (message: string) => void;
  groupOptions: string[];
  applicationOptions: string[];
}) {
  const [appFilter, setAppFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const visibleUsers = useMemo(() => users.filter((user) => (!appFilter || user.applications.includes(appFilter)) && (!groupFilter || user.groups.includes(groupFilter))), [appFilter, groupFilter, users]);
  const selected = visibleUsers.find((user) => user.id === selectedId) ?? visibleUsers[0];

  const memberRows = visibleUsers.map((user) => ({
    name: user.name,
    email: user.email,
    phone: user.phone,
    applications: user.applications.join('; '),
    groups: user.groups.join('; '),
    lastAccessed: user.lastAccessed,
  }));

  const exportCsv = () => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Email', 'Primary phone', 'SaaS applications', 'Groups', 'Last accessed'],
      ...memberRows.map((user) => [user.name, user.email, user.phone, user.applications, user.groups, user.lastAccessed]),
    ];
    const blob = new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'unified-directory-members.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    onAction('Member CSV exported ✓');
  };

  const printMembers = () => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.position = 'fixed';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    if (!doc) { frame.remove(); return; }
    const rows = memberRows.map((user) => `<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(user.phone)}</td><td>${escapeHtml(user.applications)}</td><td>${escapeHtml(user.groups)}</td><td>${escapeHtml(user.lastAccessed)}</td></tr>`).join('');
    doc.open();
    doc.write(`<!doctype html><html><head><title>Unified Directory Members</title><style>body{font-family:Arial,sans-serif;color:#172033;margin:24px}h1{font-size:20px;margin:0 0 4px}.meta{color:#64748b;font-size:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#eaf0f7;text-align:left;color:#334155}th,td{border:1px solid #cbd5e1;padding:7px 8px;vertical-align:top}tbody tr:nth-child(even){background:#f8fafc}</style></head><body><h1>Unified Directory Members</h1><div class="meta">${memberRows.length} member${memberRows.length === 1 ? '' : 's'} · current filters</div><table><thead><tr><th>Name</th><th>Email</th><th>Primary phone</th><th>SaaS applications</th><th>Groups</th><th>Last accessed</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    doc.close();
    const printWindow = frame.contentWindow;
    if (!printWindow) { frame.remove(); return; }
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      window.setTimeout(() => frame.remove(), 500);
    }, 80);
  };

  return (
    <div className="directory-workspace directory-workspace--scalable">
      <section className="directory-list-panel">
        <div className="directory-user-toolbar">
          <Toolbar query={query} onQuery={onQuery} placeholder="Search name, email, application or group"/>
          <div className="directory-filter-row"><label><span>SaaS app</span><select value={appFilter} onChange={(event) => setAppFilter(event.target.value)}><option value="">All applications</option>{applicationOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Group</span><select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)}><option value="">All groups</option>{groupOptions.map((item) => <option key={item}>{item}</option>)}</select></label><span className="directory-result-count">{visibleUsers.length} users</span><button type="button" className="directory-toolbar-action" onClick={printMembers}>Print</button><button type="button" className="directory-toolbar-action directory-toolbar-action--primary" onClick={exportCsv}>Export CSV</button></div>
        </div>
        <div className="directory-table-wrap directory-table-wrap--users scrollbar-thin">
          <table className="directory-table directory-table--users"><thead><tr><th>User</th><th>SaaS applications</th><th>Groups</th><th>Last accessed</th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id} onClick={() => onSelect(user.id)} className={selected?.id === user.id ? 'is-selected' : ''}><td><div className="directory-person"><span className="directory-avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td><ChipList items={user.applications} max={2}/></td><td><ChipList items={user.groups} max={2}/></td><td><span className="directory-muted">{user.lastAccessed}</span></td></tr>)}</tbody></table>
          {!visibleUsers.length ? <Empty copy="No users match the current search and filters."/> : null}
        </div>
      </section>
      {selected ? <UserDetails user={selected} onManageAccess={onManageAccess} onToggleActive={onToggleActive}/> : <EmptyDetail/>}
    </div>
  );
}

export function GroupWorkspace({ groups, users, query, selectedId, onQuery, onSelect, onManageMembers, onAction }: {
  groups: DirectoryGroup[]; users: DirectoryUser[]; query: string; selectedId?: string; onQuery: (value: string) => void; onSelect: (id: string) => void; onManageMembers: (group: DirectoryGroup) => void; onAction: (message: string) => void;
}) {
  const selected = groups.find((group) => group.id === selectedId) ?? groups[0];
  return <div className="directory-workspace directory-workspace--scalable"><section className="directory-list-panel"><Toolbar query={query} onQuery={onQuery} placeholder="Search group, owner or description"><span className="directory-result-count">{groups.length} groups</span></Toolbar><div className="directory-table-wrap directory-table-wrap--groups scrollbar-thin"><table className="directory-table directory-table--groups"><thead><tr><th>Group</th><th>Members</th><th>Owner</th><th>Description</th></tr></thead><tbody>{groups.map((group) => <tr key={group.id} onClick={() => onSelect(group.id)} className={selected?.id === group.id ? 'is-selected' : ''}><td><strong>{group.name}</strong></td><td><strong>{group.memberIds.length}</strong></td><td><span className="directory-muted">{group.owner}</span></td><td><span className="directory-group-description">{group.description}</span></td></tr>)}</tbody></table>{!groups.length ? <Empty copy="No groups match your search."/> : null}</div></section>{selected ? <GroupDetails group={selected} users={users} onManageMembers={onManageMembers} onAction={onAction}/> : <EmptyDetail/>}</div>;
}

function Toolbar({ query, onQuery, placeholder, children }: { query: string; onQuery: (value: string) => void; placeholder: string; children?: ReactNode }) { return <div className="directory-toolbar"><label className="directory-search"><SearchIcon size={16}/><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder}/></label>{children}</div>; }
function ChipList({ items, max }: { items: string[]; max: number }) { return <div className="directory-chip-row">{items.slice(0,max).map((item) => <span key={item}>{item}</span>)}{items.length > max ? <span>+{items.length-max}</span> : null}</div>; }

function UserDetails({ user, onManageAccess, onToggleActive }: { user: DirectoryUser; onManageAccess: (user: DirectoryUser) => void; onToggleActive: (id: string) => void }) {
  const resetUrl = resolvePlatformUrl(`/forgot-password?email=${encodeURIComponent(user.email)}`);
  return <aside className="directory-detail directory-detail--scrollable"><div className="directory-detail__identity"><span className="directory-avatar directory-avatar--lg">{initials(user.name)}</span><div><span className="metric-label text-slate-400">{user.active ? 'Active user' : 'Inactive user'}</span><h2>{user.name}</h2><p>{user.email}</p></div></div><dl className="directory-detail__facts"><Fact label="Primary phone" value={user.phone}/><Fact label="Directory source" value={user.source}/><Fact label="Last accessed" value={user.lastAccessed}/></dl><ContactDetail user={user}/><DetailSection label="SaaS application access" items={user.applications} empty="No applications assigned"/><DetailSection label="Group memberships" items={user.groups} empty="No groups assigned"/><div className="directory-detail__actions"><button type="button" className="directory-detail__primary" onClick={() => onManageAccess(user)}>Manage access</button><a className="directory-detail__link-action" href={resetUrl}>Reset password</a><button type="button" className={user.active ? 'is-danger' : ''} onClick={() => onToggleActive(user.id)}>{user.active ? 'Move to Inactive Users' : 'Reactivate user'}</button></div></aside>;
}

function ContactDetail({ user }: { user: DirectoryUser }) { return <div className="directory-detail__section"><span className="metric-label text-slate-400">Contact methods</span><div className="directory-contact-summary"><div><strong>Telephone</strong>{user.phones.filter((item) => item.number).map((item) => <span key={item.type}><b>{item.type[0]}</b>{item.number}{item.extension ? ` ext ${item.extension}` : ''}{item.primary ? <em>Primary</em> : null}</span>)}</div><div><strong>Email</strong>{user.emails.filter((item) => item.address).map((item) => <span key={item.type}><b>{item.type === 'Organization' ? 'O' : item.type[0]}</b>{item.address}{item.primary ? <em>Primary</em> : null}</span>)}</div></div></div>; }

function GroupDetails({ group, users, onManageMembers, onAction }: { group: DirectoryGroup; users: DirectoryUser[]; onManageMembers: (group: DirectoryGroup) => void; onAction: (message: string) => void }) {
  const members = group.memberIds.map((id) => users.find((user) => user.id === id)).filter((user): user is DirectoryUser => Boolean(user));
  return <aside className="directory-detail directory-detail--scrollable"><div><span className="metric-label text-slate-400">Selected group</span><h2 className="mt-1">{group.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p></div><dl className="directory-detail__facts"><Fact label="Members" value={String(group.memberIds.length)}/><Fact label="Owner" value={group.owner}/></dl><div className="directory-detail__section"><span className="metric-label text-slate-400">Members</span><div className="directory-member-preview">{members.slice(0,6).map((member) => <div key={member.id}><span className="directory-avatar">{initials(member.name)}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div>)}{members.length > 6 ? <p>+{members.length-6} more members</p> : null}</div></div><div className="directory-detail__actions"><button type="button" className="directory-detail__primary" onClick={() => onManageMembers(group)}>Add / manage users</button><button type="button" onClick={() => onAction(`Group review opened for ${group.name}`)}>Review group</button></div></aside>;
}
function DetailSection({ label, items, empty }: { label: string; items: string[]; empty: string }) { return <div className="directory-detail__section"><span className="metric-label text-slate-400">{label}</span>{items.length ? <div className="directory-chip-row directory-chip-row--roomy">{items.map((item) => <span key={item}>{item}</span>)}</div> : <p className="directory-detail__empty-copy">{empty}</p>}</div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Empty({ copy }: { copy: string }) { return <div className="directory-empty"><strong>No results</strong><span>{copy}</span></div>; }
function EmptyDetail() { return <aside className="directory-detail directory-detail--empty"><strong>Select a record</strong><span>Choose a user or group to review its details.</span></aside>; }

function escapeHtml(value: string) { const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }; return value.replace(/[&<>\"]/g, (character) => entities[character] ?? character); }
