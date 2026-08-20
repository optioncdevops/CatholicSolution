import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { environment } from '@shared/platform/config/environment';
import { useAuth } from './AuthProvider';
import { buildCentralLoginUrl } from './centralAuth';

function CentralLoginRedirect({ returnUrl }: { returnUrl: string }) {
  useEffect(() => {
    const target = buildCentralLoginUrl(returnUrl);
    if (target) window.location.replace(target);
  }, [returnUrl]);

  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Redirecting to sign in" />;
}

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return <Outlet />;

  const localReturnUrl = `${location.pathname}${location.search}${location.hash}`;
  if (environment.appId === 'platform' || environment.appId === 'cfr-admin') {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(localReturnUrl)}`} replace />;
  }

  const absoluteReturnUrl = typeof window === 'undefined' ? localReturnUrl : window.location.href;
  return <CentralLoginRedirect returnUrl={absoluteReturnUrl} />;
}
