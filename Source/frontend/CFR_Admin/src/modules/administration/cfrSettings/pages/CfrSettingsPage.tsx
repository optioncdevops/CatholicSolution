import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Dropdown, InputField } from '@app/components/formControls';
import { getUsers } from '@/modules/users';
import type { UsersApiItem } from '@/modules/users';
import { getEmailSettings, saveApiBaseUrl, saveProductRequestNotifyUser } from '@/modules/administration/emailSettings';
import type { EmailSettingsApiItem } from '@/modules/administration/emailSettings';

const LOOPBACK_OR_PRIVATE_HOST = /^https?:\/\/(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)([:/]|$)/i;

/** True when the value is a syntactically well-formed absolute http(s) URL. */
const isValidAbsoluteUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateApiBaseUrl = (value: string): string | undefined => {
  if (!value) return undefined;
  if (!isValidAbsoluteUrl(value)) return 'Enter a valid absolute URL, e.g. https://api.example.com.';
  if (!/^https:\/\//i.test(value)) return 'API base URL must start with https:// so recipients’ email clients can load the logo securely.';
  if (LOOPBACK_OR_PRIVATE_HOST.test(value)) return 'API base URL cannot be a localhost or private-network address — recipients’ email clients cannot reach it. Use the public address of this API.';
  return undefined;
};

function CfrSettingsPage() {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [users, setUsers] = useState<UsersApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [originalUserId, setOriginalUserId] = useState<string | undefined>(undefined);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [originalApiBaseUrl, setOriginalApiBaseUrl] = useState('');
  const [apiBaseUrlError, setApiBaseUrlError] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
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
        const currentUserId = settings?.productRequestNotifyUserId ? String(settings.productRequestNotifyUserId) : undefined;
        setSelectedUserId(currentUserId);
        setOriginalUserId(currentUserId);
        const currentApiBaseUrl = settings?.apiBaseUrl ?? '';
        setApiBaseUrl(currentApiBaseUrl);
        setOriginalApiBaseUrl(currentApiBaseUrl);
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
  const handleApiBaseUrlChange = (value: string) => {
    setApiBaseUrl(value);
    if (apiBaseUrlError) setApiBaseUrlError(undefined);
  };

  const isDirty = selectedUserId !== originalUserId || apiBaseUrl.trim() !== originalApiBaseUrl;

  const handleSave = async () => {
    const trimmedApiBaseUrl = apiBaseUrl.trim();
    const apiBaseUrlChanged = trimmedApiBaseUrl !== originalApiBaseUrl;

    // Only validate the API base URL when it's actually being saved this time — otherwise an
    // already-saved value that predates this validation rule (e.g. a localhost dev URL) would
    // block every future save, even one that only touches the Acutis User field.
    if (apiBaseUrlChanged) {
      const error = validateApiBaseUrl(trimmedApiBaseUrl);
      if (error) {
        setApiBaseUrlError(error);
        showToast(error, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const tasks: Promise<unknown>[] = [];
      if (selectedUserId !== originalUserId) {
        tasks.push(saveProductRequestNotifyUser(selectedUserId ? Number(selectedUserId) : null));
      }
      if (apiBaseUrlChanged) {
        tasks.push(saveApiBaseUrl(trimmedApiBaseUrl));
      }
      await Promise.all(tasks);

      setOriginalUserId(selectedUserId);
      setApiBaseUrl(trimmedApiBaseUrl);
      setOriginalApiBaseUrl(trimmedApiBaseUrl);
      showToast('CFR settings saved.', 'success');
    } catch (error) {
      console.error('Error saving CFR settings:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save CFR settings.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="CFR Settings" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex-1">
          <Dropdown
            id="ddlCfrSettingsAcutisUser"
            label="Product Authorized Person"
            searchable
            clearable
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            options={users.map((user) => ({ id: String(user.userId), value: user.fullName || user.eMail }))}
            placeholder={loading ? 'Loading users…' : 'Select a user'}
            disabled={loading || saving}
          />
        </div>

        <div className="flex-1 border-t border-[var(--line-soft)] pt-6 sm:border-t-0 sm:pt-0">
          <InputField
            id="txtCfrSettingsApiBaseUrl"
            label="API base URL"
            type="url"
            value={apiBaseUrl}
            onChange={(event) => handleApiBaseUrlChange(event.target.value)}
            placeholder="https://api.example.org/acutis"
            helperText="This API's own public address (not the admin site's URL) — used to build the email logo's image link. Must be reachable by recipients' email clients, so never a localhost or private-network address."
            disabled={loading || saving}
            error={apiBaseUrlError}
          />
        </div>
      </div>

      <div className="flex justify-center border-t border-[var(--line-soft)] pt-4">
        <CommonButton
          type="button" variant="primary" size="sm"
          iconLeft={<Save size={14} />}
          loading={saving}
          disabled={loading || saving || !isDirty}
          onClick={() => void handleSave()}
        >
          Save
        </CommonButton>
      </div>
    </div>
  );
  //#endregion
}

export default CfrSettingsPage;
