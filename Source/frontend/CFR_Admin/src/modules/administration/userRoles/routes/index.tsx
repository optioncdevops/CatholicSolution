import { lazy } from 'react';
import { Route } from 'react-router-dom';

const UserRolesListPage = lazy(() => import('../pages/UserRolesListPage'));

export const userRolesRoutes = (
  <>
    <Route path="/admin/administration-user-roles" element={<UserRolesListPage />} />
  </>
);
