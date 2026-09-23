import { lazy } from 'react';
import { Route } from 'react-router-dom';

const ProductRequestsListPage = lazy(() => import('../pages/ProductRequestsListPage'));

export const productRequestsRoutes = (
  <>
    <Route path="/admin/product-requests" element={<ProductRequestsListPage />} />
  </>
);
