import { lazy } from "react";
import { Route } from "react-router-dom";
import { PRODUCTS_PATHS } from "../utils/productHelpers";

const ProductList = lazy(() => import("../pages/ProductList"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const ProductEdit = lazy(() => import("../pages/partials/ProductEdit"));
const AddLicense = lazy(() => import("../pages/partials/AddLicense"));

export const productsRoutes = (
  <>
    <Route path={PRODUCTS_PATHS.list} element={<ProductList />} />
    <Route path={PRODUCTS_PATHS.details} element={<ProductDetails />} />
    <Route path={PRODUCTS_PATHS.featureOrganizations} element={<ProductDetails />} />
    <Route path={PRODUCTS_PATHS.featureLicenseDetails} element={<ProductDetails />} />
    <Route path={PRODUCTS_PATHS.featureLicenseHistory} element={<ProductDetails />} />
    <Route path={PRODUCTS_PATHS.featureApiIntegration} element={<ProductDetails />} />
    <Route path={PRODUCTS_PATHS.edit} element={<ProductEdit />} />
    <Route path={PRODUCTS_PATHS.addLicense} element={<AddLicense />} />
  </>
);
