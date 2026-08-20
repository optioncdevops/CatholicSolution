import { Navigate, Route, Routes } from 'react-router-dom';
import { CatholicContentPage } from '@/solution';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<CatholicContentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
