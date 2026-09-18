import { Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import LogoutPage from '../pages/LogoutPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import RequestAccessPage from '../pages/RequestAccessPage';
import Auth0CallbackPage from '../pages/Auth0CallbackPage';
import Auth0LogoutPage from '../pages/Auth0LogoutPage';

export const authenticationRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth-login" element={<LoginPage />} />
    <Route path="/auth-callback" element={<Auth0CallbackPage />} />
    <Route path="/auth-logout" element={<Auth0LogoutPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/logout" element={<LogoutPage />} />
    <Route path="/request-access" element={<RequestAccessPage />} />
  </>
);
