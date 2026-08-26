import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { acutisAuthApi } from '../api';

/**
 * Task 9 rule: "do not add password-reset functionality beyond the currently supported DEV FAKE
 * behavior." Forgot Password's backend contract is: always the same generic success response,
 * regardless of whether the email matches an account (enumeration-safety) — this page shows
 * exactly that generic message and nothing more specific, even on a network/server error.
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await acutisAuthApi.forgotPassword({ email });
    } catch {
      // Even on error, show the same generic confirmation — never reveal whether the email
      // exists or expose the raw error.
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Forgot password</h1>

        {submitted ? (
          <p className="mt-4 text-sm text-gray-700">
            If an account exists for that email, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending…' : 'Send reset link'}
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
