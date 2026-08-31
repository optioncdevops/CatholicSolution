import { lazy } from 'react';
import { Route } from 'react-router-dom';

const EmailTemplatesPage = lazy(() => import('../pages/EmailTemplatesPage'));

export const emailTemplatesRoutes = (
  <>
    <Route path="/admin/administration-email-templates" element={<EmailTemplatesPage />} />
  </>
);
