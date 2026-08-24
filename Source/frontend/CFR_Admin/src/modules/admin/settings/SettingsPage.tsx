import { useState, type FormEvent } from 'react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { Tabs, TabPanel } from '@app/components/Tabs';

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

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Settings" />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Admin profile' },
          { id: 'platform', label: 'Platform settings' },
          { id: 'notifications', label: 'Notifications' },
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
    </div>
  );
}
