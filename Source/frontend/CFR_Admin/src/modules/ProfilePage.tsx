import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { AppIcon } from '@app/components/icons';
import { Badge } from '@app/components/Badge';
import { CommonButton } from '@app/components/buttons';
import { InputField, ProfileImageUpload } from '@app/components/formControls';
import { ChangePasswordModal } from '@shared/app/components/ChangePasswordModal';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { useCurrentUser } from '@shared/app/context/UserContext';
import { getProfile, updateProfile, updateStoredAcutisUser, uploadProfileImage } from '@shared/auth/services/authService';
import { resolveProfileImageUrl } from '@shared/auth/profileImage';
import type { ProfileApiItem } from '@shared/auth/types/authTypes';
import { formatDateTime } from './utils/formatDate';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const profileRules = {
  firstName: { required: 'First name is required.' },
  lastName: { required: 'Last name is required.' },
  email: { required: 'Email is required.', pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' } },
};

const SECTION_CLASS = 'rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)]';
const SECTION_TITLE_CLASS = 'text-[10px] font-bold uppercase tracking-wide text-[var(--text-faint)]';

export function ProfilePage() {
  const { user, initials } = useCurrentUser();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // The currently-saved image (relative URL from the server) and the pending change from
  // ProfileImageUpload — kept apart from the RHF form since it isn't a plain text field.
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<ProfileFormValues>({
    defaultValues: { firstName: user.firstName, lastName: user.lastName, email: user.email },
    mode: 'onChange',
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        const { resultData } = await getProfile();
        if (cancelled || !resultData) return;
        const profile = resultData as ProfileApiItem;
        reset({
          firstName: profile.firstName ?? user.firstName,
          lastName: profile.lastName ?? user.lastName,
          email: profile.email ?? user.email,
        });
        setCurrentImageUrl(profile.profileImageUrl ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading profile:', error);
        showToast('Failed to load your profile.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount; reset/showToast/user identity changing shouldn't reload
  }, []);

  const handleImageChange = (file: File | null) => {
    setSelectedImageFile(file);
    setImageRemoved(!file);
  };

  const isImageDirty = Boolean(selectedImageFile) || imageRemoved;
  const hasUnsavedChanges = isDirty || isImageDirty;

  const resetAll = () => {
    reset();
    setSelectedImageFile(null);
    setImageRemoved(false);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setFormError('');
    setSaving(true);
    try {
      let profileImageUrl = currentImageUrl;
      if (selectedImageFile) {
        profileImageUrl = await uploadProfileImage(selectedImageFile);
      } else if (imageRemoved) {
        profileImageUrl = null;
      }

      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      const email = values.email.trim();
      await updateProfile({ firstName, lastName, email, profileImageUrl });
      updateStoredAcutisUser({ firstName, lastName, eMail: email, profileImageUrl });

      setCurrentImageUrl(profileImageUrl);
      setSelectedImageFile(null);
      setImageRemoved(false);
      reset({ firstName, lastName, email });
      showToast('Profile updated.', 'success');
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update profile.';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="My Profile" />
      <p className="-mt-2 text-sm text-[var(--text-muted)]">Manage the personal details and photo shown across Catholic Solutions.</p>

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
        <div className={`${SECTION_CLASS} flex flex-col items-center gap-4 p-6 text-center`}>
          <span className={SECTION_TITLE_CLASS}>Profile Photo</span>
          <ProfileImageUpload
            label=""
            disabled={loading || saving}
            onFileChange={handleImageChange}
            initialPreviewUrl={resolveProfileImageUrl(currentImageUrl) ?? undefined}
            fallbackInitials={initials}
            helperText="JPG or PNG, up to 2MB."
          />
          <div className="flex flex-col items-center gap-1.5 border-t border-[var(--line-soft)] pt-4">
            <span className="text-sm font-bold text-[var(--text-primary)]">{user.name}</span>
            {user.roleName ? <Badge tone="info">{user.roleName}</Badge> : null}
          </div>

          <dl className="grid w-full grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 border-t border-[var(--line-soft)] pt-4 text-left text-xs">
            <dt className="font-semibold text-[var(--text-faint)]">Status</dt>
            <dd className="justify-self-end">
              <Badge tone={user.status.toLowerCase() === 'active' ? 'success' : 'neutral'}>{user.status || 'Unknown'}</Badge>
            </dd>
            <dt className="font-semibold text-[var(--text-faint)]">Last active</dt>
            <dd className="justify-self-end text-[var(--text-secondary)]">{formatDateTime(user.lastActiveAt)}</dd>
            <dt className="font-semibold text-[var(--text-faint)]">Account ID</dt>
            <dd className="justify-self-end text-[var(--text-secondary)]">#{user.userId || '—'}</dd>
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <div className={`${SECTION_CLASS} flex flex-col gap-5 p-6`}>
            <span className={SECTION_TITLE_CLASS}>Personal Information</span>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                control={control}
                name="firstName"
                label="First name"
                rules={profileRules.firstName}
                disabled={loading || saving}
                required
                startIcon={<AppIcon name="user" size="controlField" decorative />}
              />
              <InputField
                control={control}
                name="lastName"
                label="Last name"
                rules={profileRules.lastName}
                disabled={loading || saving}
                required
                startIcon={<AppIcon name="user" size="controlField" decorative />}
              />
            </div>

            <InputField
              control={control}
              name="email"
              type="email"
              label="Email address"
              rules={profileRules.email}
              disabled={loading || saving}
              required
              startIcon={<AppIcon name="mail" size="controlField" decorative />}
              helperText="Used for sign-in and notifications from Catholic Solutions."
            />

            {formError ? <p className="text-xs font-semibold text-[var(--error)]">{formError}</p> : null}

            <div className="flex items-center justify-end gap-3 border-t border-[var(--line-soft)] pt-4">
              {hasUnsavedChanges && !saving ? (
                <span className="mr-auto text-xs font-semibold text-[var(--warning)]">You have unsaved changes</span>
              ) : null}
              <CommonButton type="button" variant="outline" disabled={saving || !hasUnsavedChanges} onClick={resetAll}>
                Cancel
              </CommonButton>
              <CommonButton type="submit" variant="primary" loading={saving} disabled={saving || loading || !hasUnsavedChanges}>
                Save changes
              </CommonButton>
            </div>
          </div>

          <div className={`${SECTION_CLASS} flex flex-col gap-1 p-6 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <span className={SECTION_TITLE_CLASS}>Security</span>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">Password</p>
              <p className="text-xs text-[var(--text-muted)]">Change the password used to sign in to CFR Acutis.</p>
            </div>
            <CommonButton type="button" variant="outline" className="shrink-0" onClick={() => setPasswordModalOpen(true)}>
              Change password
            </CommonButton>
          </div>
        </div>
      </form>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
}
