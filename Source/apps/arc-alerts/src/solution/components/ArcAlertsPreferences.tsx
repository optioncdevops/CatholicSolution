import { useMemo, useState } from 'react';
import { MailIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import {
  DIRECTORY_RECIPIENTS,
  type DirectoryEmailContact,
  type DirectoryPhoneContact,
  type DirectoryRecipient,
} from '@shared/app/data/directoryRecipients';

type Channel = 'voice' | 'email' | 'text';
type PreferenceSelection = Record<string, Record<Channel, string[]>>;
type ContactDestination = {
  id: string;
  typeCode: string;
  typeLabel: string;
  value: string;
  primary: boolean;
  unlisted?: boolean;
};

const channelMeta: Record<Channel, { label: string; hint: string }> = {
  voice: { label: 'Voice', hint: 'Available telephone numbers' },
  email: { label: 'Email', hint: 'Available email addresses' },
  text: { label: 'Text', hint: 'Available telephone numbers' },
};

function typeCode(type: DirectoryPhoneContact['type'] | DirectoryEmailContact['type']) {
  if (type === 'Home') return 'H';
  if (type === 'Work') return 'W';
  if (type === 'Mobile') return 'M';
  return 'O';
}

function phoneDestinations(member: DirectoryRecipient): ContactDestination[] {
  return member.phones.filter((item) => item.number).map((item) => ({
    id: `phone:${item.type}`,
    typeCode: typeCode(item.type),
    typeLabel: item.type,
    value: `${item.number}${item.extension ? ` ext ${item.extension}` : ''}`,
    primary: Boolean(item.primary),
    unlisted: Boolean(item.unlisted),
  }));
}

function emailDestinations(member: DirectoryRecipient): ContactDestination[] {
  return member.emails.filter((item) => item.address).map((item) => ({
    id: `email:${item.type}`,
    typeCode: typeCode(item.type),
    typeLabel: item.type,
    value: item.address,
    primary: Boolean(item.primary),
  }));
}

function destinationsFor(member: DirectoryRecipient, channel: Channel) {
  return channel === 'email' ? emailDestinations(member) : phoneDestinations(member);
}

function createInitialPreferences(): PreferenceSelection {
  return Object.fromEntries(DIRECTORY_RECIPIENTS.map((member) => {
    const phones = phoneDestinations(member);
    const emails = emailDestinations(member);
    const preferredPhone = phones.find((item) => item.primary) ?? phones[0];
    const preferredEmail = emails.find((item) => item.primary) ?? emails[0];
    return [member.id, {
      voice: preferredPhone ? [preferredPhone.id] : [],
      email: preferredEmail ? [preferredEmail.id] : [],
      text: preferredPhone ? [preferredPhone.id] : [],
    }];
  }));
}

function ContactChannelCell({
  channel,
  destinations,
  selected,
  disabled,
  onToggle,
  onSetAll,
}: {
  channel: Channel;
  destinations: ContactDestination[];
  selected: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
  onSetAll: (ids: string[]) => void;
}) {
  if (!destinations.length) {
    return <div className="arc-profile-channel-empty">Not available in profile</div>;
  }
  const allSelected = destinations.every((item) => selected.includes(item.id));
  return (
    <div className="arc-profile-channel-cell">
      <div className="arc-profile-channel-summary">
        <span>{destinations.length} {destinations.length === 1 ? 'contact' : 'contacts'}</span>
        {destinations.length > 1 ? (
          <button type="button" onClick={() => onSetAll(allSelected ? [] : destinations.map((item) => item.id))} disabled={disabled}>
            {allSelected ? 'Clear' : 'Enable all'}
          </button>
        ) : null}
      </div>
      <div className="arc-profile-channel-options">
        {destinations.map((destination) => {
          const active = selected.includes(destination.id);
          return (
            <button
              key={`${channel}-${destination.id}`}
              type="button"
              className={`arc-profile-contact-option ${active ? 'is-enabled' : ''}`}
              aria-pressed={active}
              aria-label={`${active ? 'Disable' : 'Enable'} ${channelMeta[channel].label} using ${destination.typeLabel} ${destination.value}`}
              onClick={() => onToggle(destination.id)}
              disabled={disabled}
            >
              <span className={`arc-preference-switch ${active ? 'is-enabled' : ''}`} aria-hidden="true"><i /></span>
              <span className="arc-profile-contact-type">{destination.typeCode}</span>
              <span className="arc-profile-contact-copy">
                <strong title={destination.value}>{destination.value}</strong>
                <small>{destination.typeLabel}{destination.primary ? ' - Primary' : ''}{destination.unlisted ? ' - Unlisted' : ''}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ArcAlertsPreferences() {
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<PreferenceSelection>(createInitialPreferences);
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<'all' | Channel>('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return DIRECTORY_RECIPIENTS.filter((member) => {
      const profileValues = [
        member.name,
        ...member.groups,
        ...member.phones.flatMap((item) => [item.type, item.number, item.extension ?? '']),
        ...member.emails.flatMap((item) => [item.type, item.address]),
      ];
      const matchesText = !normalized || profileValues.join(' ').toLowerCase().includes(normalized);
      const hasChannel = channel === 'all' || destinationsFor(member, channel).length > 0;
      return matchesText && hasChannel;
    });
  }, [channel, query]);

  const counts = useMemo(() => ({
    all: DIRECTORY_RECIPIENTS.length,
    voice: DIRECTORY_RECIPIENTS.filter((member) => phoneDestinations(member).length > 0).length,
    email: DIRECTORY_RECIPIENTS.filter((member) => emailDestinations(member).length > 0).length,
    text: DIRECTORY_RECIPIENTS.filter((member) => phoneDestinations(member).length > 0).length,
  }), []);

  const configuredCount = useMemo(() => Object.values(preferences).reduce((total, item) =>
    total + item.voice.length + item.email.length + item.text.length, 0), [preferences]);

  const toggleDestination = (memberId: string, key: Channel, destinationId: string) => {
    setPreferences((current) => {
      const selected = current[memberId]?.[key] ?? [];
      const next = selected.includes(destinationId)
        ? selected.filter((item) => item !== destinationId)
        : [...selected, destinationId];
      return { ...current, [memberId]: { ...current[memberId], [key]: next } };
    });
  };

  const setAllDestinations = (memberId: string, key: Channel, ids: string[]) => {
    setPreferences((current) => ({ ...current, [memberId]: { ...current[memberId], [key]: ids } }));
  };

  return (
    <div className="grid gap-4">
      <header className="arc-view-header arc-preference-page-header">
        <div>
          <p className="arc-view-kicker">Directory</p>
          <h1>User Preferences</h1>
          <p>ArcAlerts uses contact methods available on each Unified Directory profile. Enable one, multiple, or all available destinations for each channel.</p>
        </div>
        <button type="button" className={`arc-preference-master ${enabled ? 'is-enabled' : ''}`} aria-pressed={enabled} onClick={() => setEnabled((value) => !value)}>
          <span className="arc-preference-master__dot"/>
          <span><strong>{enabled ? 'Preferences enabled' : 'Preferences paused'}</strong><small>{enabled ? 'Profile channel controls are active' : 'All preference changes are paused'}</small></span>
        </button>
      </header>
      <section className="surface-card arc-preference-surface arc-preference-surface--refined">
        <div className="arc-preference-toolbar">
          <label className="arc-directory-search"><SearchIcon size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member, group, phone or email" aria-label="Search user preferences"/></label>
          <div className="arc-preference-filter-group"><span className="arc-preference-filter-label">Available channel</span><div className="arc-segmented arc-preference-segmented">{(['all','voice','email','text'] as const).map((item) => <button key={item} type="button" className={channel === item ? 'is-active' : ''} onClick={() => setChannel(item)}><span>{item === 'all' ? 'All' : channelMeta[item].label}</span><small>{counts[item]}</small></button>)}</div></div>
        </div>
        <div className="arc-preference-info-row">
          <div className="arc-preference-legend"><span><b>H</b> Home</span><span><b>W</b> Work</span><span><b>M</b> Mobile</span><span><b>O</b> Organization</span></div>
          <span className="arc-preference-info-note"><MailIcon size={14}/> Only contact details saved on the member profile are shown; each destination can be enabled independently.</span>
        </div>
        <div className="arc-preference-table-wrap arc-preference-table-wrap--refined">
          <table className="arc-preference-table arc-preference-table--profile-driven">
            <thead><tr><th><span className="arc-preference-column-title">Member</span><small>Directory profile</small></th>{(['voice','email','text'] as const).map((key) => <th key={key}><span className="arc-preference-column-title">{channelMeta[key].label}</span><small>{channelMeta[key].hint}</small></th>)}</tr></thead>
            <tbody>{filtered.map((member) => {
              const memberPreferences = preferences[member.id] ?? { voice: [], email: [], text: [] };
              const groupLabel = member.groups.length > 1 ? `${member.groups[0]} +${member.groups.length - 1}` : (member.groups[0] ?? 'No group');
              return <tr key={member.id}>
                <td><div className="arc-preference-contact arc-preference-contact--two-lines"><span className="arc-member-avatar">{member.name.split(/\s+/).map((part) => part[0]).slice(0,2).join('')}</span><span><strong>{member.name}</strong><small>{groupLabel}</small></span></div></td>
                {(['voice','email','text'] as const).map((key) => <td key={key}><ContactChannelCell channel={key} destinations={destinationsFor(member, key)} selected={memberPreferences[key]} disabled={!enabled} onToggle={(destinationId) => toggleDestination(member.id, key, destinationId)} onSetAll={(ids) => setAllDestinations(member.id, key, ids)}/></td>)}
              </tr>;
            })}</tbody>
          </table>
        </div>
        {!filtered.length ? <div className="arc-empty-state">No member profiles match the current search and available-channel filter.</div> : null}
        <footer className="arc-preference-footer"><p><strong>{filtered.length}</strong> members shown - <strong>{configuredCount}</strong> channel destinations enabled. Contact details are maintained in Unified Directory.</p><button type="button" onClick={() => showToast('ArcAlerts user preferences saved')} className="action-primary bg-gradient-to-r from-orange-600 to-rose-500 px-5 text-white">Save preferences</button></footer>
      </section>
    </div>
  );
}
