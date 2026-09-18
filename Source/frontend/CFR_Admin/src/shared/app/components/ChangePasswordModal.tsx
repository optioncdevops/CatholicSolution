import { useEffect, useState } from 'react';
import { useForm, useWatch, type SubmitHandler} from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { InputField } from '@app/components/formControls';
import { changePassword } from '@shared/auth/services/authService';
import { confirmDiscardChanges } from '@/modules/lib/confirm';
import { useToast } from './ToastProvider';

interface ChangePasswordModalProps { open: boolean; onClose: () => void; }

interface PasswordFormValues { currentPassword: string; newPassword: string; confirmPassword: string; }

const STRENGTH_LABELS = ['Weak — add more characters', 'Fair — add a number or symbol', 'Good — almost there', 'Strong password'];
const STRENGTH_COLORS = ['var(--line-soft)', 'var(--error)', 'var(--warning)', 'var(--secondary)', 'var(--success)'];

const passwordScore = (value: string) => [
  value.length >= 8,
  /[0-9]/.test(value),
  // Whitespace must not count as a "symbol" - "Abcd 123" (a space, no real special character)
  // was scoring the same as a genuine symbol, inflating its strength rating to "Strong".
  /[^A-Za-z0-9\s]/.test(value),
  /[a-z]/.test(value) && /[A-Z]/.test(value),
].filter(Boolean).length;

const passwordDefaultValues: PasswordFormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

const passwordRules = {
  currentPassword: { required: 'Current password is required.' },
  newPassword: {
    required: 'New password is required.',
    validate: (value: string, formValues: PasswordFormValues) => {
      if (value && formValues.currentPassword && value === formValues.currentPassword) {
        return 'New password must be different from your current password.';
      }
      return passwordScore(value) >= 3 || 'Use at least 8 characters, including upper- and lower-case letters and a number. Symbols recommended.';
    },
  },
  confirmPassword: {
    required: 'Please confirm your new password.',
    validate: (value: string, formValues: PasswordFormValues) => value === formValues.newPassword || 'Passwords do not match.',
  },
};

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { showToast } = useToast();
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const passwordForm = useForm<PasswordFormValues>({ defaultValues: passwordDefaultValues, mode: 'onChange' });
  const newPasswordValue = useWatch({ control: passwordForm.control, name: 'newPassword', defaultValue: '' });
  const currentPasswordValue = useWatch({ control: passwordForm.control, name: 'currentPassword', defaultValue: '' });

  // Reset the form (and transient error state) whenever the modal opens. This component stays
  // mounted across opens/closes (the parent just toggles `open`), so this is adjusted during
  // render rather than in an effect: an effect body would paint the previous values for one
  // frame before resetting, which is visible when reopening after a save.
  const [renderedOpen, setRenderedOpen] = useState(false);
  if (renderedOpen !== open) {
    setRenderedOpen(open);
    if (open) {
      setPasswordError('');
      passwordForm.reset(passwordDefaultValues);
    }
  }

  // Re-check the confirm-password field as the new password changes, so a stale
  // "passwords do not match" error clears/appears immediately instead of on its own next keystroke.
  // Also clears the manually-set "must be different from your current password" server error
  // (see onPasswordSubmit's catch block below) as soon as the user edits the field again.
  useEffect(() => {
    if (passwordForm.formState.dirtyFields.confirmPassword) {
      void passwordForm.trigger('confirmPassword');
    }
    if (passwordForm.formState.errors.newPassword?.type === 'server') {
      passwordForm.clearErrors('newPassword');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only newPasswordValue should retrigger this
  }, [newPasswordValue]);

  // The server-side "current password is incorrect" error is set manually (see onPasswordSubmit's
  // catch block below) — clear it as soon as the user edits the field again, instead of leaving a
  // stale error attached to a value they've already changed.
  useEffect(() => {
    if (passwordForm.formState.errors.currentPassword?.type === 'server') {
      passwordForm.clearErrors('currentPassword');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only currentPasswordValue should retrigger this
  }, [currentPasswordValue]);

  const onPasswordSubmit: SubmitHandler<PasswordFormValues> = async (values) => {
    setPasswordError('');
    setPasswordSaving(true);
    try {
      await changePassword(values);
      showToast('Password changed.', 'success');
      onClose();
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to change password.';
      // Both of these are about one specific field — anchor each at its own input (aria-invalid +
      // aria-describedby via InputField's own error prop) instead of leaving it as a banner at the
      // bottom of the form, disconnected from the field it's actually about.
      if (/current password is incorrect/i.test(message)) {
        passwordForm.setError('currentPassword', { type: 'server', message });
      } else if (/must be different from your current password/i.test(message)) {
        passwordForm.setError('newPassword', { type: 'server', message });
      } else {
        setPasswordError(message);
      }
      showToast(message, 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const onInvalid = (formErrors: any) => {
    const messages = Object.entries(formErrors).map(([key, error]: [string, any]) => {
      if (error?.message === 'This field is required') {
        let fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        if (key === 'eMail' || key === 'email') fieldName = 'email address';
        if (key === 'roleId') fieldName = 'role';
        if (key === 'isActive') fieldName = 'status';
        if (key === 'isLocked') fieldName = 'locked';
        fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return `${fieldName} is required.`;
      }
      return error?.message;
    }).filter(Boolean);
    showToast(messages.length > 0 ? messages : ['Please fill in the required fields.'], 'error');
  };

  const score = passwordScore(newPasswordValue);

  const handleClose = async () => {
    if (passwordForm.formState.isDirty) {
      const confirmed = await confirmDiscardChanges();
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <BaseModal
      id="dlgChangePassword"
      isOpen={open}
      onClose={() => void handleClose()}
      title="Change Password"
      size="sm"
      footer={(
        <>
          <CommonButton id="btnCancelChangePassword" variant="outline" onClick={() => void handleClose()} disabled={passwordSaving}>Cancel</CommonButton>
          <CommonButton id="btnUpdatePassword" variant="primary" type="submit" form="formChangePassword" loading={passwordSaving} disabled={passwordSaving}>Update password</CommonButton>
        </>
      )}
    >
      <form id="formChangePassword" onSubmit={(event) => void passwordForm.handleSubmit(onPasswordSubmit, onInvalid)(event)} className="flex flex-col gap-4" noValidate>
        <p className="-mt-2 text-xs text-[var(--text-muted)]">Choose a strong password you do not use elsewhere.</p>

        <InputField id="txtCurrentPassword" control={passwordForm.control} name="currentPassword" type="password" label="Current password" rules={passwordRules.currentPassword} disabled={passwordSaving} required />

        <div>
          <InputField id="txtNewPassword" control={passwordForm.control} name="newPassword" type="password" label="New password" rules={passwordRules.newPassword} disabled={passwordSaving} required />
          <div className="mt-1.5 flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((bar) => (
              <span key={bar} className="h-1 flex-1 rounded-full" style={{ background: bar <= score ? STRENGTH_COLORS[score] : STRENGTH_COLORS[0] }} />
            ))}
          </div>
          <p className="mt-1 text-xs font-semibold text-[var(--text-faint)]">{newPasswordValue ? STRENGTH_LABELS[Math.max(score - 1, 0)] : 'At least 8 characters, including upper- and lower-case letters and a number. Symbols recommended.'}</p>
        </div>

        <InputField id="txtConfirmPassword" control={passwordForm.control} name="confirmPassword" type="password" label="Confirm new password" rules={passwordRules.confirmPassword} disabled={passwordSaving} required />

        {passwordError ? <p className="text-xs font-semibold text-[var(--error)]">{passwordError}</p> : null}
      </form>
    </BaseModal>
  );
}
