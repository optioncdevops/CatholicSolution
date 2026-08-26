import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';

/**
 * Gates authenticated pages. Checks token PRESENCE AND EXPIRY (not presence alone — the reference
 * app's own gap, see docs/acutis-auth-spec/reference-comparison.md §8). A genuinely unauthenticated
 * visit goes to /auth/login; a token that was valid but has since expired also lands here (via the
 * same isAuthenticated check) rather than being treated as a "session expired mid-request" case —
 * that distinct path (an active API call hitting 401) is handled separately, by
 * AuthProvider's registered unauthorized handler routing to /auth/session-expired.
 *
 * `requiredPermission`, if given, additionally prevents navigation to a page the user's own
 * moduleRights don't include — client-side UX only (Task 9 rule: "do not calculate final
 * authorization only in the frontend"). The backend independently enforces [Authorize] on every
 * endpoint regardless of what this component allows to render.
 */
export function ProtectedRoute({ requiredPermission }: { requiredPermission?: string }) {
  const { isAuthenticated, isInitializing, hasPermission } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
