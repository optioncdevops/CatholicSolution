import { useMemo, useState } from 'react';
import { MailIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';

type Channel = 'voice' | 'email' | 'text';
type PreferenceRow = {
  id: string;
  family: string;
  contact: string;
  relation: string;
  voice: boolean;
  email: boolean;
  text: boolean;
  phone?: string;
  emailAddress?: string;
};

const initialRows: PreferenceRow[] = [
  { id: '1', family: 'Andani Family', contact: 'Marco Andani', relation: 'Father · Home', voice: true, email: true, text: true, phone: '(555) 123-4567', emailAddress: 'marco.andani@example.org' },
  { id: '2', family: 'Andani Family', contact: 'Rafaela Andani', relation: 'Mother · Mobile', voice: true, email: true, text: false, phone: '(555) 123-4568', emailAddress: 'rafaela.andani@example.org' },
  { id: '3', family: 'Angelica Family', contact: 'Teresa Angelica', relation: 'Guardian · Work', voice: false, email: true, text: true, phone: '(555) 989-7654', emailAddress: 'teresa.angelica@example.org' },
  { id: '4', family: 'Aarthi Family', contact: 'Aarthi A.', relation: 'Mother · Work', voice: true, email: true, text: true, phone: '(324) 233-4222', emailAddress: 'aarthi@example.org' },
  { id: '5', family: 'Alexander Family', contact: 'Michael Alexander', relation: 'Parent · Mobile', voice: true, email: false, text: true, phone: '(234) 323-4234', emailAddress: 'michael.alexander@example.org' },
  { id: '6', family: 'Admin Staff', contact: 'Front Office', relation: 'Staff · Work', voice: true, email: true, text: false, phone: '(555) 555-5555', emailAddress: 'office@example.org' },
];

const channelMeta: Record<Channel, { label: string; hint: string }> = {
  voice: { label: 'Voice', hint: 'Phone calls' },
  email: { label: 'Email', hint: 'Email notices' },
  text: { label: 'Text', hint: 'SMS messages' },
};

function ChannelToggle({ enabled, label, detail, onToggle, disabled }: { enabled: boolean; label: string; detail?: string; onToggle: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="arc-preference-channel" aria-pressed={enabled} aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}${detail ? ` for ${detail}` : ''}`} onClick={onToggle} disabled={disabled}>
      <span className={`arc-preference-switch ${enabled ? 'is-enabled' : ''}`} aria-hidden="true"><i /></span>
      <span className="arc-preference-channel__copy"><strong>{enabled ? 'Enabled' : 'Off'}</strong><small title={detail}>{detail || 'Not provided'}</small></span>
    </button>
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
      const matchesText = !normalized || [row.family, row.contact, row.relation, row.phone, row.emailAddress].filter(Boolean).join(' ').toLowerCase().includes(normalized);
      const matchesChannel = channel === 'all' || row[channel];
      return matchesText && matchesChannel;
    });
  }, [channel, query, rows]);

  const counts = useMemo(() => ({
    all: rows.length,
    voice: rows.filter((row) => row.voice).length,
    email: rows.filter((row) => row.email).length,
    text: rows.filter((row) => row.text).length,
  }), [rows]);

  const toggleChannel = (id: string, key: Channel) => setRows((current) => current.map((row) => row.id === id ? { ...row, [key]: !row[key] } : row));

  return (
    <div className="grid gap-4">
      <header className="arc-view-header arc-preference-page-header">
        <div><p className="arc-view-kicker">Directory</p><h1>User Preferences</h1><p>Choose exactly how each directory contact receives ArcAlerts. Contact details remain managed by the source directory.</p></div>
        <button type="button" className={`arc-preference-master ${enabled ? 'is-enabled' : ''}`} aria-pressed={enabled} onClick={() => setEnabled((value) => !value)}><span className="arc-preference-master__dot" /><span><strong>{enabled ? 'Preferences enabled' : 'Preferences paused'}</strong><small>{enabled ? 'Channel controls are active' : 'All preference changes are paused'}</small></span></button>
      </header>

      <section className="surface-card arc-preference-surface">
        <div className="arc-preference-toolbar">
          <label className="arc-directory-search"><SearchIcon size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search family, contact, phone or email" aria-label="Search user preferences" /></label>
          <div className="arc-preference-filter-group" aria-label="Preference channel filter">
            <span className="arc-preference-filter-label">Show</span>
            <div className="arc-segmented arc-preference-segmented">
              {(['all', 'voice', 'email', 'text'] as const).map((item) => (
                <button key={item} type="button" className={channel === item ? 'is-active' : ''} onClick={() => setChannel(item)}>
                  <span>{item === 'all' ? 'All contacts' : channelMeta[item].label}</span><small>{counts[item]}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="arc-preference-info-row">
          <div className="arc-preference-legend"><span><b>H</b> Home</span><span><b>W</b> Work</span><span><b>M</b> Mobile</span></div>
          <span className="arc-preference-info-note"><MailIcon size={14} /> Toggle a channel in the grid, then save your changes.</span>
        </div>

        <div className="arc-preference-table-wrap">
          <table className="arc-preference-table">
            <thead>
              <tr>
                <th><span className="arc-preference-column-title">Family / contact</span><small>Directory identity</small></th>
                {(['voice', 'email', 'text'] as const).map((key) => <th key={key}><span className="arc-preference-column-title">{channelMeta[key].label}</span><small>{channelMeta[key].hint}</small></th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td><div className="arc-preference-contact"><span className="arc-member-avatar">{row.contact.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span><span><strong>{row.contact}</strong><b>{row.family}</b><small>{row.relation}</small></span></div></td>
                  <td><ChannelToggle enabled={row.voice} label="voice" detail={row.phone} onToggle={() => toggleChannel(row.id, 'voice')} disabled={!enabled} /></td>
                  <td><ChannelToggle enabled={row.email} label="email" detail={row.emailAddress} onToggle={() => toggleChannel(row.id, 'email')} disabled={!enabled} /></td>
                  <td><ChannelToggle enabled={row.text} label="text" detail={row.phone} onToggle={() => toggleChannel(row.id, 'text')} disabled={!enabled} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <div className="arc-empty-state">No contacts match the current search and channel filter.</div> : null}
        <footer className="arc-preference-footer"><p><strong>{filtered.length}</strong> contacts shown · Changes remain local until saved.</p><button type="button" onClick={() => showToast('ArcAlerts user preferences saved ✓')} className="action-primary bg-gradient-to-r from-orange-600 to-rose-500 px-5 text-white">Save preferences</button></footer>
      </section>
    </div>
  );
}
