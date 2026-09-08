import { lazy } from 'react';
import { Route } from 'react-router-dom';

const EmailSettingsPage = lazy(() => import('../pages/EmailSettingsPage'));

export const emailSettingsRoutes = (
  <>
    <Route path="/admin/administration-email-settings" element={<EmailSettingsPage />} />
  </>
);
