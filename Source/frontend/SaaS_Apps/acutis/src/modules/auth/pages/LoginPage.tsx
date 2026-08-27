import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { RequiredMark } from '@/components/RequiredMark';
import { acutisAuthApi, ApiError } from '../api';
import { useAuth } from '../hooks/useAuth';
import { applyServerFieldErrors, emailRule, requiredPasswordRule } from '../validation';

interface LoginFormValues {
  userName: string;
  password: string;
}

const KNOWN_FIELDS = ['userName', 'password'] as const;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: 'onBlur', defaultValues: { userName: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await acutisAuthApi.login({ userName: values.userName.trim(), password: values.password });
      login({ user: result.user, token: result.user.token, moduleRights: result.moduleRights, menuItems: result.menuItems });
      navigate('/', { replace: true });
    } catch (err) {
      applyServerFieldErrors(err, setError, KNOWN_FIELDS);
      // Generic, security-safe message only — never echoes the raw error or any credential.
      setError('root', { type: 'server', message: err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.' });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Sign in to Acutis</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Email
              <RequiredMark />
            </label>
            <input
              id="userName"
              type="email"
              autoComplete="username"
              disabled={isSubmitting}
              aria-invalid={!!errors.userName}
              aria-describedby={errors.userName ? 'userName-error' : undefined}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
              {...register('userName', emailRule)}
            />
            {errors.userName && (
              <p id="userName-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
              <RequiredMark />
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
              {...register('password', requiredPasswordRule)}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.password.message}
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
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/auth/forgot-password" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
