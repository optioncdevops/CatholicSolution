import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/modules/auth/context/AuthProvider';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage';
import { ChangePasswordPage } from '@/modules/auth/pages/ChangePasswordPage';
import { UnauthorizedPage } from '@/modules/auth/pages/UnauthorizedPage';
import { SessionExpiredPage } from '@/modules/auth/pages/SessionExpiredPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { DashboardPage } from '@/pages/DashboardPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/session-expired" element={<SessionExpiredPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/account/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
