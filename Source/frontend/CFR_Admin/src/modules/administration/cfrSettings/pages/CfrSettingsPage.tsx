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

const SECTION_LABEL_CLASS = 'mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]';
const SECTION_HINT_CLASS = 'mb-3 text-xs text-[var(--text-muted)]';

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
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [originalApiBaseUrl, setOriginalApiBaseUrl] = useState('');
  const [apiBaseUrlError, setApiBaseUrlError] = useState<string | undefined>(undefined);
  const [savingApiBaseUrl, setSavingApiBaseUrl] = useState(false);
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

  const handleApiBaseUrlChange = (value: string) => {
    setApiBaseUrl(value);
    if (apiBaseUrlError) setApiBaseUrlError(undefined);
  };

  const handleSaveApiBaseUrl = async () => {
    const trimmed = apiBaseUrl.trim();
    const error = validateApiBaseUrl(trimmed);
    if (error) {
      setApiBaseUrlError(error);
      showToast(error, 'error');
      return;
    }

    setSavingApiBaseUrl(true);
    try {
      await saveApiBaseUrl(trimmed);
      setApiBaseUrl(trimmed);
      setOriginalApiBaseUrl(trimmed);
      showToast('API base URL saved.', 'success');
    } catch (error) {
      console.error('Error saving API base URL:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save API base URL.', 'error');
    } finally {
      setSavingApiBaseUrl(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="CFR Settings" />

      <div>
        <p className={SECTION_LABEL_CLASS}>Product Request Notifications</p>
        <p className={SECTION_HINT_CLASS}>Which Acutis user receives an email when a new product is suggested.</p>
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

      <div className="border-t border-[var(--line-soft)] pt-4">
        <p className={SECTION_LABEL_CLASS}>API Base URL</p>
        <p className={SECTION_HINT_CLASS}>This API&apos;s own public address (not the admin site&apos;s URL) — used to build the email logo&apos;s image link. If this API is only reachable through a reverse proxy/gateway (e.g. https://cfrapi.example.com/acutis), include that path here too, or the logo link will 404. Must be reachable by recipients&apos; email clients, so never a localhost or private-network address, even while testing locally.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <InputField
            id="txtCfrSettingsApiBaseUrl"
            label="API base URL"
            type="url"
            value={apiBaseUrl}
            onChange={(event) => handleApiBaseUrlChange(event.target.value)}
            placeholder="https://api.example.org/acutis"
            disabled={loading || savingApiBaseUrl}
            error={apiBaseUrlError}
            wrapperClassName="w-full sm:max-w-md"
          />
          <CommonButton
            type="button" variant="primary" size="sm"
            iconLeft={<Save size={14} />}
            loading={savingApiBaseUrl}
            disabled={loading || savingApiBaseUrl || apiBaseUrl.trim() === originalApiBaseUrl}
            onClick={() => void handleSaveApiBaseUrl()}
          >
            Save
          </CommonButton>
        </div>
      </div>
    </div>
  );
  //#endregion
}

export default CfrSettingsPage;
