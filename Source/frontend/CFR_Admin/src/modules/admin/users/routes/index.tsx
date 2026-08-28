import { lazy } from 'react';
import { Route } from 'react-router-dom';

const UsersListPage = lazy(() => import('../pages/UsersListPage'));
const UserDetailPage = lazy(() => import('../pages/UserDetailPage'));

export const usersRoutes = (
  <>
    <Route path="/admin/users" element={<UsersListPage />} />
    <Route path="/admin/users/:userId" element={<UserDetailPage />} />
  </>
);
