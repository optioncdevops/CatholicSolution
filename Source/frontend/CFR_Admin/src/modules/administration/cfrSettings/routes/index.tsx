import { lazy } from 'react';
import { Route } from 'react-router-dom';

const CfrSettingsPage = lazy(() => import('../pages/CfrSettingsPage'));

export const cfrSettingsRoutes = (
  <>
    <Route path="/admin/administration-cfr-settings" element={<CfrSettingsPage />} />
  </>
);
