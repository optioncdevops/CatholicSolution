import { useToast } from '@shared/app/components/ToastProvider';

export function ArcAlertsSettings() {
  const { showToast } = useToast();
  return (
    <div className="grid gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Administration</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Settings</h1></div>
      <form className="surface-card arc-settings-card" onSubmit={(event) => { event.preventDefault(); showToast('ArcAlerts settings saved ✓'); }}>
        <div className="arc-settings-note">All settings are used as default values when creating a new alert. They can still be adjusted while composing an individual alert.</div>
        <div className="arc-settings-grid">
          <label className="arc-settings-field"><span className="arc-settings-field__label">Reply-To Email <b>*</b></span><input type="email" required defaultValue="noreply@optionc.net"/></label>
          <label className="arc-settings-field"><span className="arc-settings-field__label">Phone Caller ID</span><input defaultValue="(585) 555-5555"/></label>
          <label className="arc-settings-field"><span className="arc-settings-field__label">Phone To Call For Recording Voice Message</span><input defaultValue="(208) 301-7525"/></label>
          <label className="arc-settings-field"><span className="arc-settings-field__label">Timezone</span><select defaultValue="Eastern Time"><option>Eastern Time</option><option>Central Time</option><option>Mountain Time</option><option>Pacific Time</option></select></label>
          <div className="arc-settings-field arc-settings-field--info"><span>Failed Alerts Notified To (Email)</span><p>An email will be sent to the alert creator’s work email if an alert does not process successfully.</p></div>
          <label className="arc-settings-field"><span className="arc-settings-field__label">ArcAlerts Name <b>*</b></span><input required defaultValue="St. Gobnait of Ballyvourney Demo School"/></label>
        </div>
        <div className="arc-settings-actions"><button type="submit" className="action-primary bg-emerald-600 px-5 text-white hover:bg-emerald-700">Save settings</button></div>
      </form>
    </div>
  );
}
