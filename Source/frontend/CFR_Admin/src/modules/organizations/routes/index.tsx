import { lazy } from 'react';
import { Route } from 'react-router-dom';

const OrganizationsListPage = lazy(() => import('../OrganizationsListPage').then((m) => ({ default: m.OrganizationsListPage })));
const OrganizationAddPage = lazy(() => import('../liveOrganizations/pages/OrganizationAddPage'));
const OrganizationDetailPage = lazy(() => import('../liveOrganizations/pages/OrganizationDetailPage'));

export const organizationsRoutes = (
  <>
    <Route path="/admin/organizations" element={<OrganizationsListPage />} />
    <Route path="/admin/organizations/add" element={<OrganizationAddPage />} />
    <Route path="/admin/organizations/:orgId" element={<OrganizationDetailPage />} />
  </>
);
