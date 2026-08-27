import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { RequiredMark } from '@/components/RequiredMark';
import { acutisAuthApi, ApiError } from '../api';
import { applyServerFieldErrors, newPasswordPolicyRule, requiredPasswordRule } from '../validation';

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const KNOWN_FIELDS = ['newPassword', 'confirmPassword'] as const;

/**
 * Reads `token` from the URL query string (the emailed reset link's shape — see
 * docs/acutis-auth-spec/security-model.md). The token-write path always reports the generic
 * "invalid or expired" failure while no real reset-token store/write path exists yet
 * (docs/acutis-auth-spec/database-contract.md) — this page surfaces that response as-is, it does
 * not pretend the feature works end-to-end.
 */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ mode: 'onBlur', defaultValues: { newPassword: '', confirmPassword: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await acutisAuthApi.resetPassword({ token, newPassword: values.newPassword, confirmPassword: values.confirmPassword });
      // Clear password fields after a successful submission — nothing sensitive lingers in form state.
      reset({ newPassword: '', confirmPassword: '' });
      setSuccess(true);
    } catch (err) {
      applyServerFieldErrors(err, setError, KNOWN_FIELDS);
      setError('root', { type: 'server', message: err instanceof ApiError ? err.message : 'Unable to reset password. Please try again.' });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Reset password</h1>

        {!token && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            This reset link is missing its token.
          </p>
        )}

        {success ? (
          <p className="mt-4 text-sm text-gray-700">Password reset successfully. You can now sign in.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New password
                <RequiredMark />
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting || !token}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
                {...register('newPassword', { ...requiredPasswordRule, ...newPasswordPolicyRule })}
              />
              {errors.newPassword && (
                <p id="newPassword-error" role="alert" className="mt-1 text-sm text-red-700">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm new password
                <RequiredMark />
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting || !token}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
                {...register('confirmPassword', {
                  ...requiredPasswordRule,
                  validate: (value) => value === getValues('newPassword') || 'Passwords do not match.',
                })}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-red-700">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {errors.root?.message && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        <Link to="/auth/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
