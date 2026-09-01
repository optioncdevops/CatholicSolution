import { lazy } from "react";
import { Route } from "react-router-dom";
import { PRODUCTS_PATHS } from "../utils/productHelpers";

const ProductList = lazy(() => import("../pages/ProductList"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const ProductEdit = lazy(() => import("../pages/partials/ProductEdit"));
const AddLicense = lazy(() => import("../pages/partials/AddLicense"));

export const productsRoutes = (
  <>
    <Route path="/admin/products" element={<ProductList />} />
    <Route path="/admin/products/:slug" element={<ProductDetails />} />
    <Route path="/admin/products/:slug/edit" element={<ProductEdit />} />
    <Route path="/admin/products/:slug/add-license" element={<AddLicense />} />
    <Route path="/admin/products/details" element={<ProductDetails />} />
    <Route path="/admin/products/edit" element={<ProductEdit />} />
    <Route path="/admin/products/add-license" element={<AddLicense />} />
  </>
);
