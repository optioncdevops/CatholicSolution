import { Route } from 'react-router-dom';
import { CentralLoginPage } from '../pages/CentralLoginPage';
import { CentralLogoutPage } from '../pages/CentralLogoutPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

export const authenticationRoutes = (
  <>
    <Route path="/login" element={<CentralLoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/logout" element={<CentralLogoutPage />} />
  </>
);
