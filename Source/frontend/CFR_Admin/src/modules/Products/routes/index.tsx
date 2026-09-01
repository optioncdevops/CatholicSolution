import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';

const ProductsListPage = lazy(() => import('../pages/ProductsListPage'));
const ProductDetailPage = lazy(() => import('../pages/partials/ProductDetailPage'));
const ProductEditPage = lazy(() => import('../pages/partials/ProductEditPage'));
const CreateInvoicePage = lazy(() => import('../pages/partials/CreateInvoicePage'));

export const productsRoutes = (
  <>
    <Route path="/admin/products" element={<ProductsListPage />} />
    <Route path="/admin/products/:productId" element={<ProductDetailPage />} />
    <Route path="/admin/products/:productId/edit" element={<ProductEditPage />} />
    <Route path="/admin/products/:productId/invoices/create" element={<CreateInvoicePage />} />

    {/* Legacy path redirect */}
    <Route path="/admin/applications" element={<Navigate to="/admin/products" replace />} />
    <Route path="/admin/applications/:appId" element={<Navigate to="/admin/products" replace />} />
  </>
);
