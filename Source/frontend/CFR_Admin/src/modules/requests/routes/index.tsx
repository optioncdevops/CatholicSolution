import { lazy } from 'react';
import { Route } from 'react-router-dom';

const RequestsListPage = lazy(() => import('../pages/RequestsListPage'));

export const requestsRoutes = (
  <>
    <Route path="/admin/requests" element={<RequestsListPage />} />
  </>
);
