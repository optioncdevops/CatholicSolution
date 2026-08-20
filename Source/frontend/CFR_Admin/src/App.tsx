import { Navigate, Route, Routes } from 'react-router-dom';
import { CentralLoginPage } from '@shared/auth/CentralLoginPage';
import { CentralLogoutPage } from '@shared/auth/CentralLogoutPage';
import { ForgotPasswordPage } from '@shared/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@shared/auth/ResetPasswordPage';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';
import { AdminDashboardPage } from '@/modules/admin/AdminDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<CentralLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<CentralLogoutPage />} />
      <Route path="/" element={<Navigate to="/login?client_id=cfr-admin&entry=platform&returnUrl=/admin" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
