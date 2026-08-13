import { useState, type FormEvent } from 'react';
import { useToast } from '@shared/app/components/ToastProvider';
import { ArcAlertsChannelDetails, type AlertChannel } from './ArcAlertsChannelDetails';
import { ArcAlertsRecipientPicker, type AudienceMode } from './ArcAlertsRecipientPicker';

const channels: AlertChannel[] = ['Email', 'Voice', 'Text'];

export function ArcAlertsNewAlert() {
  const { showToast } = useToast();
  const [selectedChannels, setSelectedChannels] = useState<AlertChannel[]>(['Email', 'Voice', 'Text']);
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('members');
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const recipientCount = audienceMode === 'members' ? selectedMembers.length : selectedGroups.length;
  const toggleChannel = (channel: AlertChannel) => setSelectedChannels((current) =>
    current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel],
  );

  const submitAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChannels.length) { showToast('Select at least one delivery channel'); return; }
    if (!recipientCount) { showToast('Select at least one member or group'); return; }
    showToast(`Prototype alert queued for ${recipientCount} ${audienceMode === 'members' ? 'member' : 'group'} selection${recipientCount === 1 ? '' : 's'} ✓`);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Compose</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">New Alert</h1></div>
        <span className="text-xs font-bold text-slate-400">Email · Voice · Text</span>
      </div>

      <section className="surface-card overflow-hidden">
        <form className="arc-alert-compose" onSubmit={submitAlert}>
          <div className="arc-alert-basics">
            <label className="arc-field"><span>Alert title <b>*</b></span><input required placeholder="e.g. Early dismissal notice" /></label>
            <label className="arc-field"><span>Alert type</span><select defaultValue="General notice"><option>General notice</option><option>Emergency</option><option>Weather</option><option>Transportation</option><option>Event reminder</option><option>Schedule change</option></select></label>
            <label className="arc-field"><span>Priority</span><select defaultValue="Normal"><option>Normal</option><option>High</option><option>Emergency</option></select></label>
          </div>

          <div className="arc-channel-selector">
            <div><strong>Delivery channels</strong><small>Only selected channels display message details below.</small></div>
            <div>{channels.map((channel) => {
              const active = selectedChannels.includes(channel);
              return <label key={channel} className={active ? 'is-selected' : ''}><input type="checkbox" checked={active} onChange={() => toggleChannel(channel)}/><span>{channel}</span></label>;
            })}</div>
          </div>

          <ArcAlertsRecipientPicker
            mode={audienceMode}
            onModeChange={setAudienceMode}
            query={memberQuery}
            onQueryChange={setMemberQuery}
            selectedMembers={selectedMembers}
            onMembersChange={setSelectedMembers}
            selectedGroups={selectedGroups}
            onGroupsChange={setSelectedGroups}
          />

          <ArcAlertsChannelDetails selectedChannels={selectedChannels}/>

          <div className="arc-alert-send-row">
            <label className="arc-field"><span>Send</span><select defaultValue="Immediately"><option>Immediately</option><option>Schedule for later</option></select></label>
            <div className="arc-alert-send-actions"><button type="button" onClick={() => showToast('Preview generated')} className="action-secondary">Preview</button><button type="button" onClick={() => showToast('Draft saved')} className="action-secondary">Save draft</button><button type="submit" className="action-primary bg-gradient-to-r from-orange-600 to-red-600 px-5 text-white">Send alert</button></div>
          </div>
        </form>
      </section>
    </div>
  );
}
