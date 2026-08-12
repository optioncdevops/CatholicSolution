import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/modules/authentication/LoginPage';
import { RequestAccessPage } from '@/modules/authentication/RequestAccessPage';
import { AppHubPage } from '@/modules/appHub/AppHubPage';
import { CentralLogoutPage } from '@shared/auth/CentralLogoutPage';
import { ForgotPasswordPage } from '@shared/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@shared/auth/ResetPasswordPage';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<CentralLogoutPage />} />
      <Route path="/request-access" element={<RequestAccessPage />} />
      <Route path="/" element={<Navigate to="/login?entry=platform" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/apps" element={<AppHubPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/apps" replace />} />
    </Routes>
  );
}
