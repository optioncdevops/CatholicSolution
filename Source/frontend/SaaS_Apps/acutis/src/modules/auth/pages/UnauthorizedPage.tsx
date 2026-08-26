import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
      <p className="max-w-sm text-sm text-gray-600">
        You don&apos;t have permission to view this page. If you believe this is a mistake, contact your administrator.
      </p>
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
