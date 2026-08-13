import { useMemo, useState } from 'react';
import { MailIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';

type Channel = 'voice' | 'email' | 'text';
type PreferenceRow = {
  id: string;
  family: string;
  contact: string;
  relation: string;
  phoneType: 'Home' | 'Work' | 'Mobile';
  emailType: 'Home' | 'Work' | 'Organization';
  voice: boolean;
  email: boolean;
  text: boolean;
  phone: string;
  emailAddress: string;
  unlisted?: boolean;
};

const initialRows: PreferenceRow[] = [
  { id: '1', family: 'Andani Family', contact: 'Marco Andani', relation: 'Father', phoneType: 'Home', emailType: 'Home', voice: true, email: true, text: true, phone: '(555) 123-4567', emailAddress: 'marco.andani@example.org' },
  { id: '2', family: 'Andani Family', contact: 'Rafaela Andani', relation: 'Mother', phoneType: 'Mobile', emailType: 'Work', voice: true, email: true, text: false, phone: '(555) 123-4568', emailAddress: 'rafaela.andani@example.org' },
  { id: '3', family: 'Angelica Family', contact: 'Teresa Angelica', relation: 'Guardian', phoneType: 'Work', emailType: 'Work', voice: false, email: true, text: true, phone: '(555) 989-7654', emailAddress: 'teresa.angelica@example.org' },
  { id: '4', family: 'Aarthi Family', contact: 'Aarthi A.', relation: 'Mother', phoneType: 'Work', emailType: 'Home', voice: true, email: true, text: true, phone: '(324) 233-4222', emailAddress: 'aarthi@example.org' },
  { id: '5', family: 'Alexander Family', contact: 'Michael Alexander', relation: 'Parent', phoneType: 'Mobile', emailType: 'Organization', voice: true, email: false, text: true, phone: '(234) 323-4234', emailAddress: 'michael.alexander@example.org' },
  { id: '6', family: 'Admin Staff', contact: 'Front Office', relation: 'Staff', phoneType: 'Work', emailType: 'Organization', voice: true, email: true, text: false, phone: '(555) 555-5555', emailAddress: 'office@example.org', unlisted: true },
];

const channelMeta: Record<Channel, { label: string; hint: string }> = {
  voice: { label: 'Voice', hint: 'Phone call' },
  email: { label: 'Email', hint: 'Email notice' },
  text: { label: 'Text', hint: 'SMS message' },
};

function typeCode(type: PreferenceRow['phoneType'] | PreferenceRow['emailType']) {
  if (type === 'Home') return 'H';
  if (type === 'Work') return 'W';
  if (type === 'Mobile') return 'M';
  return 'O';
}

function ChannelToggle({ enabled, label, detail, type, onToggle, disabled, unlisted }: { enabled: boolean; label: string; detail: string; type: string; onToggle: () => void; disabled?: boolean; unlisted?: boolean }) {
  return (
    <div className="arc-channel-cell">
      <button type="button" className="arc-channel-toggle" aria-pressed={enabled} aria-label={`${enabled ? 'Disable' : 'Enable'} ${label} for ${detail}`} onClick={onToggle} disabled={disabled}><span className={`arc-preference-switch ${enabled ? 'is-enabled' : ''}`} aria-hidden="true"><i /></span><span>{enabled ? 'On' : 'Off'}</span></button>
      <div className="arc-channel-value"><b>{type}</b><span title={detail}>{detail}</span>{unlisted ? <em>Unlisted</em> : null}</div>
    </div>
  );
}

export function ArcAlertsPreferences() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<PreferenceRow[]>(initialRows.map((row) => ({ ...row })));
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<'all' | Channel>('all');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesText = !normalized || [row.family, row.contact, row.relation, row.phone, row.emailAddress, row.phoneType, row.emailType].join(' ').toLowerCase().includes(normalized);
      return matchesText && (channel === 'all' || row[channel]);
    });
  }, [channel, query, rows]);
  const counts = useMemo(() => ({ all: rows.length, voice: rows.filter((row) => row.voice).length, email: rows.filter((row) => row.email).length, text: rows.filter((row) => row.text).length }), [rows]);
  const toggleChannel = (id: string, key: Channel) => setRows((current) => current.map((row) => row.id === id ? { ...row, [key]: !row[key] } : row));

  return (
    <div className="grid gap-4">
      <header className="arc-view-header arc-preference-page-header"><div><p className="arc-view-kicker">Directory</p><h1>User Preferences</h1><p>Communication details come from Unified Directory. Choose which primary phone and email destinations ArcAlerts may use for each person.</p></div><button type="button" className={`arc-preference-master ${enabled ? 'is-enabled' : ''}`} aria-pressed={enabled} onClick={() => setEnabled((value) => !value)}><span className="arc-preference-master__dot"/><span><strong>{enabled ? 'Preferences enabled' : 'Preferences paused'}</strong><small>{enabled ? 'Channel controls are active' : 'All preference changes are paused'}</small></span></button></header>
      <section className="surface-card arc-preference-surface arc-preference-surface--refined">
        <div className="arc-preference-toolbar"><label className="arc-directory-search"><SearchIcon size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member, family, phone or email" aria-label="Search user preferences"/></label><div className="arc-preference-filter-group"><span className="arc-preference-filter-label">Filter</span><div className="arc-segmented arc-preference-segmented">{(['all','voice','email','text'] as const).map((item) => <button key={item} type="button" className={channel === item ? 'is-active' : ''} onClick={() => setChannel(item)}><span>{item === 'all' ? 'All' : channelMeta[item].label}</span><small>{counts[item]}</small></button>)}</div></div></div>
        <div className="arc-preference-info-row"><div className="arc-preference-legend"><span><b>H</b> Home</span><span><b>W</b> Work</span><span><b>M</b> Mobile</span><span><b>O</b> Organization</span></div><span className="arc-preference-info-note"><MailIcon size={14}/> Primary directory contact details are shown below.</span></div>
        <div className="arc-preference-table-wrap arc-preference-table-wrap--refined">
          <table className="arc-preference-table arc-preference-table--refined"><thead><tr><th><span className="arc-preference-column-title">Member</span><small>Family / relationship</small></th>{(['voice','email','text'] as const).map((key) => <th key={key}><span className="arc-preference-column-title">{channelMeta[key].label}</span><small>{channelMeta[key].hint}</small></th>)}</tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><div className="arc-preference-contact arc-preference-contact--two-lines"><span className="arc-member-avatar">{row.contact.split(/\s+/).map((part) => part[0]).slice(0,2).join('')}</span><span><strong>{row.contact}</strong><small>{row.family} · {row.relation}</small></span></div></td><td><ChannelToggle enabled={row.voice} label="voice" detail={row.phone} type={typeCode(row.phoneType)} onToggle={() => toggleChannel(row.id,'voice')} disabled={!enabled} unlisted={row.unlisted}/></td><td><ChannelToggle enabled={row.email} label="email" detail={row.emailAddress} type={typeCode(row.emailType)} onToggle={() => toggleChannel(row.id,'email')} disabled={!enabled}/></td><td><ChannelToggle enabled={row.text} label="text" detail={row.phone} type={typeCode(row.phoneType)} onToggle={() => toggleChannel(row.id,'text')} disabled={!enabled} unlisted={row.unlisted}/></td></tr>)}</tbody></table>
        </div>
        {!filtered.length ? <div className="arc-empty-state">No contacts match the current search and channel filter.</div> : null}
        <footer className="arc-preference-footer"><p><strong>{filtered.length}</strong> contacts shown · Update contact numbers and email addresses in Unified Directory.</p><button type="button" onClick={() => showToast('ArcAlerts user preferences saved ✓')} className="action-primary bg-gradient-to-r from-orange-600 to-rose-500 px-5 text-white">Save preferences</button></footer>
      </section>
    </div>
  );
}
