import { Link } from 'react-router-dom';

/** Reached when the shared 401 handler (see @/lib/httpClient) fires — distinct from a plain, never-logged-in visit to /auth/login. */
export function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Session expired</h1>
      <p className="max-w-sm text-sm text-gray-600">Your session has ended. Please sign in again to continue.</p>
      <Link
        to="/auth/login"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Sign in
      </Link>
    </div>
  );
}
