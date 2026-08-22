import { Navigate, Route, Routes } from 'react-router-dom';
import { CentralLoginPage } from '@shared/auth/CentralLoginPage';
import { CentralLogoutPage } from '@shared/auth/CentralLogoutPage';
import { ForgotPasswordPage } from '@shared/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@shared/auth/ResetPasswordPage';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';
import { AdminDataProvider } from '@/modules/admin/AdminDataContext';
import { AdminShell } from '@/modules/admin/components/AdminShell';
import { DashboardPage } from '@/modules/admin/DashboardPage';
import { ProductsListPage } from '@/modules/admin/applications/ProductsListPage';
import { ProductDetailPage } from '@/modules/admin/applications/ProductDetailPage';
import { OrganizationsListPage } from '@/modules/admin/organizations/OrganizationsListPage';
import { OrganizationDetailPage } from '@/modules/admin/organizations/OrganizationDetailPage';
import { UsersListPage } from '@/modules/admin/users/UsersListPage';
import { UserDetailPage } from '@/modules/admin/users/UserDetailPage';
import { RequestsInboxPage } from '@/modules/admin/requests/RequestsInboxPage';
import { SettingsPage } from '@/modules/admin/settings/SettingsPage';
import { UserRolesPage } from '@/modules/admin/administration/UserRolesPage';
import { RightsPage } from '@/modules/admin/administration/RightsPage';
import { EmailTemplatesPage } from '@/modules/admin/administration/EmailTemplatesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<CentralLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/logout" element={<CentralLogoutPage />} />
      <Route path="/" element={<Navigate to="/login?client_id=cfr-admin&entry=platform&returnUrl=/admin" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={(
            <AdminDataProvider>
              <AdminShell />
            </AdminDataProvider>
          )}
        >
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/applications" element={<ProductsListPage />} />
          <Route path="/admin/applications/:appId" element={<ProductDetailPage />} />
          <Route path="/admin/organizations" element={<OrganizationsListPage />} />
          <Route path="/admin/organizations/:orgId" element={<OrganizationDetailPage />} />
          <Route path="/admin/users" element={<UsersListPage />} />
          <Route path="/admin/users/:userId" element={<UserDetailPage />} />
          <Route path="/admin/requests" element={<RequestsInboxPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/administration/user-roles" element={<UserRolesPage />} />
          <Route path="/admin/administration/rights" element={<RightsPage />} />
          <Route path="/admin/administration/email-templates" element={<EmailTemplatesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
