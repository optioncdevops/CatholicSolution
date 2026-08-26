import { useEffect, useState } from 'react';
import { acutisAuthApi, ApiError } from '@/modules/auth/api';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { AcutisCurrentUser, AcutisMenuGroup } from '@/modules/auth/types';
import { NavMenu } from '@/components/NavMenu';

export function DashboardPage() {
  const { token, menuItems, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<AcutisCurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Seeded from the login-time snapshot, then refreshed from the live menus endpoint below.
  // Menus are non-critical UI, so a refresh failure silently keeps the cached tree rather than
  // surfacing an error — the 401/403 handlers already cover any auth-relevant failure globally.
  const [menus, setMenus] = useState<AcutisMenuGroup[]>(menuItems);

  useEffect(() => {
    if (!token) return;
    acutisAuthApi
      .getCurrentUser(token)
      .then(setCurrentUser)
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Unable to load your profile.'));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    acutisAuthApi
      .getMenus(token, menuItems)
      .then(setMenus)
      .catch(() => {
        // Keep the cached menuItems already shown; menus are non-critical UI.
      });
  }, [token, menuItems]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <NavMenu groups={menus} />
      </aside>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {currentUser && (
          <p className="mt-4 text-sm text-gray-600">
            Signed in as <span className="font-medium">{currentUser.fullName}</span> ({currentUser.email})
          </p>
        )}
      </main>
    </div>
  );
}
