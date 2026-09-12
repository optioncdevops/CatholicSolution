import { lazy } from 'react';
import { Route } from 'react-router-dom';

const CFRUsersPage = lazy(() => import('../pages/CFRUsersPage'));

export const cfrUsersRoutes = (
  <>
    <Route path="/admin/cfr-users" element={<CFRUsersPage />} />
  </>
);
