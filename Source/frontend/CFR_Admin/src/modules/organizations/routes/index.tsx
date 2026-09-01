import { lazy } from 'react';
import { Route } from 'react-router-dom';

const OrganizationsListPage = lazy(() => import('../pages/OrganizationsListPage').then((m) => ({ default: m.OrganizationsListPage })));
const OrganizationAddPage = lazy(() => import('../pages/OrganizationAddPage'));
const OrganizationDetailPage = lazy(() => import('../pages/OrganizationDetailPage'));

export const organizationsRoutes = (
  <>
    <Route path="/admin/organizations" element={<OrganizationsListPage />} />
    <Route path="/admin/organizations/add" element={<OrganizationAddPage />} />
    <Route path="/admin/organizations/:orgId" element={<OrganizationDetailPage />} />
  </>
);
