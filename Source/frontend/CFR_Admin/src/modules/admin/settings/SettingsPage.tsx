import { useState, type FormEvent } from 'react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { Tabs, TabPanel } from '../components/Tabs';

const EMAIL_TEMPLATES = [
  { id: 'welcome', label: 'Welcome email', subject: 'Welcome to Catholic Solutions', body: 'Hi {{first_name}},\n\nYour Catholic Solutions account is ready. Sign in to get started with your organization\'s workspace.' },
  { id: 'access-approved', label: 'Access approved', subject: 'Your application access request was approved', body: 'Hi {{first_name}},\n\nYour request for access to {{app_name}} has been approved. You can now launch it from App Hub.' },
  { id: 'access-info', label: 'More information needed', subject: 'More information needed for your request', body: 'Hi {{first_name}},\n\nWe need a bit more information to process your request for {{app_name}}:\n\n{{note}}' },
];

export function SettingsPage() {
  const { user, updateUser } = useCurrentUser();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [platformName, setPlatformName] = useState('Catholic Solutions');
  const [supportEmail, setSupportEmail] = useState('support@optioncapp.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notifications, setNotifications] = useState({ newRequests: true, weeklyDigest: true, productUpdates: false });
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0].id);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    updateUser({ name: name.trim(), email: email.trim(), phone: user.phone });
    showToast('Profile updated ✓');
  };
  const savePlatform = (event: FormEvent) => {
    event.preventDefault();
    showToast('Platform settings saved ✓ (prototype only, not persisted)');
  };
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
    showToast('Notification preference updated ✓');
  };

  const template = EMAIL_TEMPLATES.find((item) => item.id === selectedTemplate) ?? EMAIL_TEMPLATES[0];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Settings" description="Admin profile, platform configuration and notification preferences." />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Admin profile' },
          { id: 'platform', label: 'Platform settings' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'templates', label: 'Email templates' },
        ]}
      />

      <TabPanel id="profile" activeId={activeTab}>
        <form onSubmit={saveProfile} className="flex max-w-md flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-4">
          <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
            Full name
            <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
          </label>
          <div className="flex justify-end pt-1">
            <button type="submit" className="action-primary">Save profile</button>
          </div>
        </form>
      </TabPanel>

      <TabPanel id="platform" activeId={activeTab}>
        <form onSubmit={savePlatform} className="flex max-w-md flex-col gap-3 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-4">
          <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
            Platform display name
            <input value={platformName} onChange={(event) => setPlatformName(event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
            Support email
            <input type="email" value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--line-soft)] px-3 py-2.5">
            <span>
              <span className="block text-sm font-bold text-[var(--text-primary)]">Maintenance mode</span>
              <span className="block text-xs text-[var(--text-muted)]">Show a maintenance banner across the platform.</span>
            </span>
            <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode((value) => !value)} className="size-4" />
          </label>
          <div className="flex justify-end pt-1">
            <button type="submit" className="action-primary">Save settings</button>
          </div>
        </form>
      </TabPanel>

      <TabPanel id="notifications" activeId={activeTab}>
        <ul className="flex max-w-md flex-col gap-2">
          {([
            ['newRequests', 'New access requests', 'Get notified when an organization submits a request.'],
            ['weeklyDigest', 'Weekly digest', 'A weekly summary of platform activity.'],
            ['productUpdates', 'Product updates', 'Announcements about new Catholic Solutions features.'],
          ] as const).map(([key, label, description]) => (
            <li key={key} className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <span>
                <span className="block text-sm font-bold text-[var(--text-primary)]">{label}</span>
                <span className="block text-xs text-[var(--text-muted)]">{description}</span>
              </span>
              <input type="checkbox" checked={notifications[key]} onChange={() => toggleNotification(key)} className="size-4" />
            </li>
          ))}
        </ul>
      </TabPanel>

      <TabPanel id="templates" activeId={activeTab}>
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          <ul className="flex flex-col gap-1">
            {EMAIL_TEMPLATES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(item.id)}
                  className={`w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-[0.8125rem] font-bold ${
                    item.id === selectedTemplate ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover)]'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Subject</p>
            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{template.subject}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Body preview</p>
            <pre className="mt-1 whitespace-pre-wrap rounded-[var(--radius-control)] bg-[var(--surface-muted)] p-3 font-sans text-[0.8125rem] leading-6 text-[var(--text-secondary)]">{template.body}</pre>
            <p className="mt-3 text-xs text-[var(--text-faint)]">Preview only — this prototype does not send email.</p>
          </div>
        </div>
      </TabPanel>
    </div>
  );
}
