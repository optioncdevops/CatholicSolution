import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '@/components/Modal';
import { RequiredMark } from '@/components/RequiredMark';
import { acutisAuthApi, ApiError } from '../api';
import { useAuth } from '../hooks/useAuth';
import {
  applyServerFieldErrors,
  newPasswordPolicyRule,
  PASSWORD_POLICY_DESCRIPTION,
  requiredPasswordRule,
} from '../validation';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const KNOWN_FIELDS = ['currentPassword', 'newPassword', 'confirmPassword'] as const;

interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: string;
  disabled: boolean;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<ChangePasswordFormValues>>['register']>;
  helperText?: string;
}

/** One labeled password input with a "Show"/"Hide" text toggle, matching the common modal design. */
function PasswordField({ id, label, autoComplete, disabled, error, registration, helperText }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        <RequiredMark />
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full rounded-md border border-gray-300 px-3 py-2 pr-14 text-sm disabled:opacity-60"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : (
        helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/** Authenticated page — reached only via ProtectedRoute. Verify step is real (DEV FAKE credential); write step always reports the "not yet supported" blocker, shown as-is. */
export function ChangePasswordPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    mode: 'onBlur',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const close = () => navigate('/');

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setSuccess(false);
    try {
      await acutisAuthApi.changePassword(token, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      // Clear all password fields after a successful submission — nothing sensitive lingers in form state.
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
    } catch (err) {
      applyServerFieldErrors(err, setError, KNOWN_FIELDS);
      setError('root', { type: 'server', message: err instanceof ApiError ? err.message : 'Unable to change password. Please try again.' });
    }
  });

  return (
    <Modal title="Change password" description="Choose a strong password you do not use elsewhere." onClose={close} closeDisabled={isSubmitting}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <PasswordField
            id="currentPassword"
            label="Current password"
            autoComplete="current-password"
            disabled={isSubmitting}
            error={errors.currentPassword?.message}
            registration={register('currentPassword', requiredPasswordRule)}
          />
          <Link to="/auth/forgot-password" className="mt-1 inline-block text-sm font-medium text-blue-600 hover:underline">
            Forgot your current password? Start account recovery
          </Link>
        </div>

        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors.newPassword?.message}
          helperText={PASSWORD_POLICY_DESCRIPTION}
          registration={register('newPassword', {
            ...requiredPasswordRule,
            validate: (value) => {
              const policyResult = newPasswordPolicyRule.validate(value);
              if (policyResult !== true) return policyResult;
              return value !== getValues('currentPassword') || 'New password must be different from the current password.';
            },
          })}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          registration={register('confirmPassword', {
            ...requiredPasswordRule,
            validate: (value) => value === getValues('newPassword') || 'Passwords do not match.',
          })}
        />

        {errors.root?.message && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.root.message}
          </p>
        )}
        {success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Password changed successfully.</p>}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
