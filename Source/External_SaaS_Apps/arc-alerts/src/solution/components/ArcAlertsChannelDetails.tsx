import { useState, type ReactNode } from 'react';
import { ChevronDownIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';

export type AlertChannel = 'Email' | 'Voice' | 'Text';

interface ArcAlertsChannelDetailsProps {
  selectedChannels: AlertChannel[];
}

interface DetailPanelProps {
  channel: AlertChannel;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function DetailPanel({ channel, expanded, onToggle, children }: DetailPanelProps) {
  return (
    <section className={`arc-channel-panel ${expanded ? 'is-open' : ''}`}>
      <button type="button" className="arc-channel-panel__header" onClick={onToggle} aria-expanded={expanded}>
        <span><strong>{channel} details</strong><small>Configure the {channel.toLowerCase()} content sent with this alert.</small></span>
        <ChevronDownIcon size={18}/>
      </button>
      {expanded ? <div className="arc-channel-panel__body">{children}</div> : null}
    </section>
  );
}

export function ArcAlertsChannelDetails({ selectedChannels }: ArcAlertsChannelDetailsProps) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState<Record<AlertChannel, boolean>>({ Email: true, Voice: false, Text: false });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('noreply@optionc.net');
  const [phoneToCall, setPhoneToCall] = useState('(208) 301-7525');
  const [recordingId, setRecordingId] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const toggle = (channel: AlertChannel) => setExpanded((current) => ({ ...current, [channel]: !current[channel] }));
  const recordVoice = () => {
    setRecordingId('VR-20260813-001');
    showToast('Prototype recording request created. Voice Recording ID is ready.');
  };
  const segments = textMessage.length ? Math.ceil(textMessage.length / 140) : 1;

  if (!selectedChannels.length) return null;

  return (
    <div className="arc-channel-stack">
      {selectedChannels.includes('Email') ? (
        <DetailPanel channel="Email" expanded={expanded.Email} onToggle={() => toggle('Email')}>
          <div className="arc-channel-grid arc-channel-grid--email">
            <label className="arc-field arc-field--wide"><span>Subject <b>*</b></span><input value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="Email subject" /></label>
            <label className="arc-field"><span>Reply-To Email <b>*</b></span><input type="email" value={replyToEmail} onChange={(event) => setReplyToEmail(event.target.value)} /></label>
            <div className="arc-field arc-field--wide"><span>Message <b>*</b></span><div className="arc-rich-editor"><div className="arc-rich-editor__toolbar" aria-label="Email formatting toolbar"><button type="button"><b>B</b></button><button type="button"><i>I</i></button><button type="button"><u>U</u></button><button type="button">• List</button><button type="button">1. List</button><button type="button">Link</button></div><textarea value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} rows={8} placeholder="Write the email message recipients will receive..." /></div></div>
            <div className="arc-attachment-row"><button type="button" className="action-secondary" onClick={() => showToast('Attachment picker opened')}>Attach file</button><span>Optional attachments can be added before sending.</span></div>
          </div>
        </DetailPanel>
      ) : null}

      {selectedChannels.includes('Voice') ? (
        <DetailPanel channel="Voice" expanded={expanded.Voice} onToggle={() => toggle('Voice')}>
          <div className="arc-channel-note">To record a message, confirm the callback number and select <strong>Record voicemail via phone call</strong>. The recording ID is populated after the recording workflow completes.</div>
          <div className="arc-channel-grid arc-channel-grid--voice">
            <label className="arc-field"><span>Phone To Call</span><div className="arc-inline-action"><input value={phoneToCall} onChange={(event) => setPhoneToCall(event.target.value)} /><button type="button" onClick={recordVoice}>Record voicemail via phone call</button></div></label>
            <label className="arc-field"><span>Voice Recording ID <b>*</b></span><input value={recordingId} onChange={(event) => setRecordingId(event.target.value)} placeholder="Created after recording" /></label>
          </div>
        </DetailPanel>
      ) : null}

      {selectedChannels.includes('Text') ? (
        <DetailPanel channel="Text" expanded={expanded.Text} onToggle={() => toggle('Text')}>
          <label className="arc-field arc-field--wide"><span>Text Message <b>*</b></span><textarea value={textMessage} onChange={(event) => setTextMessage(event.target.value)} rows={4} maxLength={420} placeholder="Text message" /><small>{textMessage.length}/420 characters · {segments} SMS segment{segments === 1 ? '' : 's'}. Messages longer than 140 characters are sent as multiple segments.</small></label>
        </DetailPanel>
      ) : null}
    </div>
  );
}
