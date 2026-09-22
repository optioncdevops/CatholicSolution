import { Route } from 'react-router-dom';
import ProductsPage from '../pages/ProductsPage';
import ProductRequestPage from '../pages/ProductRequestPage';

export const productsRoutes = (
  <>
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/request-product" element={<ProductRequestPage />} />
  </>
);
