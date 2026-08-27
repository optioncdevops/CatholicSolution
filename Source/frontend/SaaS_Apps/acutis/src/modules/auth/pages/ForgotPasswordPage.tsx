import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { RequiredMark } from '@/components/RequiredMark';
import { acutisAuthApi } from '../api';
import { emailRule } from '../validation';

interface ForgotPasswordFormValues {
  email: string;
}

/**
 * Forgot Password's backend contract is: always the same generic success response, regardless of
 * whether the email matches an account (enumeration-safety) — this page shows exactly that generic
 * message and nothing more specific, even on a network/server error.
 */
export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordFormValues>({ mode: 'onBlur', defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await acutisAuthApi.forgotPassword({ email: values.email.trim() });
    } catch {
      // Even on error, show the same generic confirmation — never reveal whether the email
      // exists or expose the raw error.
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Forgot password</h1>

        {isSubmitSuccessful ? (
          <p className="mt-4 text-sm text-gray-700">
            If an account exists for that email, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
                <RequiredMark />
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
                {...register('email', emailRule)}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-sm text-red-700">
                  {errors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
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
