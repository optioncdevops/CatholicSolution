import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { PRODUCTS_PATHS } from "../utils/productHelpers";

const ProductList = lazy(() => import("../pages/ProductList"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const ProductEdit = lazy(() => import("../pages/partials/ProductEdit"));
const AddLicense = lazy(() => import("../pages/partials/AddLicense"));

export const productsRoutes = (
  <>
    <Route path={PRODUCTS_PATHS.list} element={<ProductList />} />
    <Route path={PRODUCTS_PATHS.details} element={<ProductDetails />} />
    <Route path={PRODUCTS_PATHS.edit} element={<ProductEdit />} />
    <Route path={PRODUCTS_PATHS.addLicense} element={<AddLicense />} />

    <Route
      path="/admin/applications"
      element={<Navigate to={PRODUCTS_PATHS.list} replace />}
    />
    <Route
      path="/admin/applications/:appId"
      element={<Navigate to={PRODUCTS_PATHS.list} replace />}
    />
    <Route
      path="/admin/applications/:appId/edit"
      element={<Navigate to={PRODUCTS_PATHS.list} replace />}
    />
    <Route
      path="/admin/products/:productId/edit"
      element={<Navigate to={PRODUCTS_PATHS.list} replace />}
    />
    <Route
      path="/admin/products/:productId/invoices/create"
      element={<Navigate to={PRODUCTS_PATHS.list} replace />}
    />
    <Route
      path="/admin/products/:productId"
      element={<Navigate to={PRODUCTS_PATHS.list} replace />}
    />
  </>
);
