import { useEffect, useState } from 'react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { Dropdown } from '@app/components/formControls';
import { getUsers } from '@/modules/users';
import type { UsersApiItem } from '@/modules/users';
import { getEmailSettings, saveProductRequestNotifyUser } from '@/modules/administration/emailSettings';
import type { EmailSettingsApiItem } from '@/modules/administration/emailSettings';

function CfrSettingsPage() {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [users, setUsers] = useState<UsersApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [usersResponse, settingsResponse] = await Promise.all([getUsers(), getEmailSettings()]);
        if (cancelled) return;

        const usersList = usersResponse.statusCode === 204 ? [] : (Array.isArray(usersResponse.resultData) ? usersResponse.resultData as UsersApiItem[] : []);
        setUsers(usersList);

        const settings = settingsResponse.resultData as EmailSettingsApiItem | null;
        setSelectedUserId(settings?.productRequestNotifyUserId ? String(settings.productRequestNotifyUserId) : undefined);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading CFR settings:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load settings.', 'error');
        setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);
  //#endregion

  //#region Handlers
  const handleSelectUser = async (value: string | undefined) => {
    setSelectedUserId(value);
    setSaving(true);
    try {
      await saveProductRequestNotifyUser(value ? Number(value) : null);
      showToast(value ? 'Product request notifications will be sent to this user.' : 'Product request notification recipient cleared.');
    } catch (error) {
      console.error('Error saving notification recipient:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save notification recipient.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="CFR Settings" />

      <div className="w-72">
        <Dropdown
          id="ddlCfrSettingsAcutisUser"
          label="Acutis User"
          searchable
          clearable
          value={selectedUserId}
          onValueChange={(value) => void handleSelectUser(value)}
          options={users.map((user) => ({ id: String(user.userId), value: user.fullName || user.eMail }))}
          placeholder={loading ? 'Loading users…' : 'Select a user'}
          disabled={loading || saving}
        />
      </div>
    </div>
  );
  //#endregion
}

export default CfrSettingsPage;
