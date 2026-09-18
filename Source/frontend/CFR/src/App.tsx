import { Navigate, Route, Routes } from 'react-router-dom';
import { authenticationRoutes, ProtectedRoute } from '@/modules/authentication';
import { productlaunchRoutes } from '@/modules/productlaunch';

export default function App() {
  return (
    <Routes>
      {authenticationRoutes}
      <Route path="/" element={<Navigate to="/login?entry=platform" replace />} />
      <Route element={<ProtectedRoute />}>
        {productlaunchRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/apps" replace />} />
    </Routes>
  );
}
