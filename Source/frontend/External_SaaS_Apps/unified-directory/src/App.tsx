import { Navigate, Route, Routes } from 'react-router-dom';
import { UnifiedDirectoryPage } from '@/solution';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<UnifiedDirectoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
