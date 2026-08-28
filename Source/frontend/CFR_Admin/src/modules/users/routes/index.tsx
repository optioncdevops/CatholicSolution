import { lazy } from 'react';
import { Route } from 'react-router-dom';

const UsersListPage = lazy(() => import('../pages/UsersListPage'));
const AddUsers = lazy(() => import('../pages/partials/AddUsers'));

export const usersRoutes = (
  <>
    <Route path="/admin/users" element={<UsersListPage />} />
    <Route path="/admin/add-users" element={<AddUsers />} />
    <Route path="/admin/edit-users" element={<AddUsers />} />
  </>
);
