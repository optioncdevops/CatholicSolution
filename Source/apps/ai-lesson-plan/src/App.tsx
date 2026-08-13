import { Navigate, Route, Routes } from 'react-router-dom';
import { LessonPlanPage } from '@/solution';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<LessonPlanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
