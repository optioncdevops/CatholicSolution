import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CentralLoginPage } from '@shared/auth/CentralLoginPage';
import { CentralLogoutPage } from '@shared/auth/CentralLogoutPage';
import { ForgotPasswordPage } from '@shared/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@shared/auth/ResetPasswordPage';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';
import { AdminDataProvider } from '@/modules/admin/AdminDataContext';
import { AdminShell } from '@/modules/admin/components/AdminShell';

// Route-level code splitting — each admin page (and the ported dataTable/formControls code it
// pulls in) loads as its own chunk on first visit instead of one 2MB+ bundle up front.
const DashboardPage = lazy(() => import('@/modules/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductsListPage = lazy(() => import('@/modules/admin/applications/ProductsListPage').then((m) => ({ default: m.ProductsListPage })));
const ProductDetailPage = lazy(() => import('@/modules/admin/applications/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const ProductEditPage = lazy(() => import('@/modules/admin/applications/ProductEditPage').then((m) => ({ default: m.ProductEditPage })));
const CreateInvoicePage = lazy(() => import('@/modules/admin/applications/CreateInvoicePage').then((m) => ({ default: m.CreateInvoicePage })));
const OrganizationsListPage = lazy(() => import('@/modules/admin/organizations/OrganizationsListPage').then((m) => ({ default: m.OrganizationsListPage })));
const OrganizationDetailPage = lazy(() => import('@/modules/admin/organizations/OrganizationDetailPage').then((m) => ({ default: m.OrganizationDetailPage })));
const UsersListPage = lazy(() => import('@/modules/admin/users/UsersListPage').then((m) => ({ default: m.UsersListPage })));
const UserDetailPage = lazy(() => import('@/modules/admin/users/UserDetailPage').then((m) => ({ default: m.UserDetailPage })));
const RequestsInboxPage = lazy(() => import('@/modules/admin/requests/RequestsInboxPage').then((m) => ({ default: m.RequestsInboxPage })));
const UserRolesPage = lazy(() => import('@/modules/admin/administration/UserRolesPage').then((m) => ({ default: m.UserRolesPage })));
const RightsPage = lazy(() => import('@/modules/admin/administration/RightsPage').then((m) => ({ default: m.RightsPage })));
const EmailTemplatesPage = lazy(() => import('@/modules/admin/administration/EmailTemplatesPage').then((m) => ({ default: m.EmailTemplatesPage })));
const InvoiceItemsPage = lazy(() => import('@/modules/admin/administration/InvoiceItemsPage').then((m) => ({ default: m.InvoiceItemsPage })));
// Dev-only component reference — see the removal note at the top of either sample page file.
const SampleAddPage = lazy(() => import('@/modules/admin/sample/SampleAddPage').then((m) => ({ default: m.SampleAddPage })));
const SampleViewPage = lazy(() => import('@/modules/admin/sample/SampleViewPage').then((m) => ({ default: m.SampleViewPage })));

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
          <Route path="/admin/applications/:appId/edit" element={<ProductEditPage />} />
          <Route path="/admin/applications/:appId/invoices/create" element={<CreateInvoicePage />} />
          <Route path="/admin/organizations" element={<OrganizationsListPage />} />
          <Route path="/admin/organizations/:orgId" element={<OrganizationDetailPage />} />
          <Route path="/admin/users" element={<UsersListPage />} />
          <Route path="/admin/users/:userId" element={<UserDetailPage />} />
          <Route path="/admin/requests" element={<RequestsInboxPage />} />
          <Route path="/admin/administration/user-roles" element={<UserRolesPage />} />
          <Route path="/admin/administration/rights" element={<RightsPage />} />
          <Route path="/admin/administration/email-templates" element={<EmailTemplatesPage />} />
          <Route path="/admin/administration/invoice-items" element={<InvoiceItemsPage />} />
          {/* Dev-only — see the removal note at the top of SampleAddPage.tsx / SampleViewPage.tsx. */}
          <Route path="/admin/administration/component-library/add" element={<SampleAddPage />} />
          <Route path="/admin/administration/component-library/view" element={<SampleViewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
