import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { acutisAuthApi, ApiError } from '../api';

/**
 * Reads `token` from the URL query string (the emailed reset link's shape — see
 * docs/acutis-auth-spec/security-model.md). Per Task 9's rule, this only exercises the currently
 * supported DEV FAKE behavior: the token-write path always reports the generic
 * "invalid or expired" failure, since no real reset-token store/write path exists yet
 * (docs/acutis-auth-spec/database-contract.md) — this page surfaces that response as-is, it does
 * not pretend the feature works end-to-end.
 */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = newPassword.length > 0 && newPassword === confirmPassword;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await acutisAuthApi.resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isSubmitting || !token}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting || !token}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || isSubmitting || !token}
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
