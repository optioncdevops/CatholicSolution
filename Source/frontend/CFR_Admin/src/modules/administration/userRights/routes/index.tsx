import { lazy } from 'react';
import { Route } from 'react-router-dom';

const UserRightsPage = lazy(() => import('../pages/UserRightsPage'));

export const userRightsRoutes = (
  <>
    <Route path="/admin/administration-rights" element={<UserRightsPage />} />
  </>
);
