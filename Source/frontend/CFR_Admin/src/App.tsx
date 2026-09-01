import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CentralLoginPage } from '@shared/auth/CentralLoginPage';
import { CentralLogoutPage } from '@shared/auth/CentralLogoutPage';
import { ForgotPasswordPage } from '@shared/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@shared/auth/ResetPasswordPage';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';
import { AdminDataProvider } from '@/modules/AdminDataContext';
import { AdminShell } from '@/modules/components/AdminShell';
import { usersRoutes } from '@/modules/users';
import { userRolesRoutes } from '@/modules/administration/userRoles';
import { emailTemplatesRoutes } from '@/modules/administration/emailTemplates';
import { organizationsRoutes } from '@/modules/organizations';
import { requestsRoutes } from '@/modules/requests';

// Route-level code splitting — each admin page (and the ported dataTable/formControls code it
// pulls in) loads as its own chunk on first visit instead of one 2MB+ bundle up front.
const DashboardPage = lazy(() => import('@/modules/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductsListPage = lazy(() => import('@/modules/applications/ProductsListPage').then((m) => ({ default: m.ProductsListPage })));
const ProductDetailPage = lazy(() => import('@/modules/applications/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const ProductEditPage = lazy(() => import('@/modules/applications/ProductEditPage').then((m) => ({ default: m.ProductEditPage })));
const CreateInvoicePage = lazy(() => import('@/modules/applications/CreateInvoicePage').then((m) => ({ default: m.CreateInvoicePage })));
const RequestsInboxPage = lazy(() => import('@/modules/requests/RequestsInboxPage').then((m) => ({ default: m.RequestsInboxPage })));
const OrganizationsListPage = lazy(() => import('@/modules/organizations/OrganizationsListPage').then((m) => ({ default: m.OrganizationsListPage })));
const OrganizationDetailPage = lazy(() => import('@/modules/organizations/OrganizationDetailPage').then((m) => ({ default: m.OrganizationDetailPage })));
const RightsPage = lazy(() => import('@/modules/administration/RightsPage').then((m) => ({ default: m.RightsPage })));
// Dev-only component reference — see the removal note at the top of either sample page file.
const SampleAddPage = lazy(() => import('@/modules/sample/SampleAddPage').then((m) => ({ default: m.SampleAddPage })));
const SampleViewPage = lazy(() => import('@/modules/sample/SampleViewPage').then((m) => ({ default: m.SampleViewPage })));

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
          {organizationsRoutes}
          {usersRoutes}
          {userRolesRoutes}
          {requestsRoutes}
          <Route path="/admin/administration-rights" element={<RightsPage />} />
          {emailTemplatesRoutes}
          {/* Dev-only — see the removal note at the top of SampleAddPage.tsx / SampleViewPage.tsx. */}
          <Route path="/admin/administration/component-library/add" element={<SampleAddPage />} />
          <Route path="/admin/administration/component-library/view" element={<SampleViewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
