import { Route, Routes } from 'react-router-dom';
import { ArcAlertsPage } from '@/solution';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<ArcAlertsPage />} />
      </Route>
    </Routes>
  );
}
