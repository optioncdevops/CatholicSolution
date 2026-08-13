import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@shared/auth/ProtectedRoute';
import { LessonWorkspaceLayout } from '@/solution/LessonWorkspaceLayout';
import { MyClassesPage } from '@/solution/pages/MyClassesPage';
import { ClassSummaryPage } from '@/solution/pages/ClassSummaryPage';
import { CalendarPage } from '@/solution/pages/CalendarPage';
import { UnitPlansPage } from '@/solution/pages/UnitPlansPage';
import { LessonPlansPage } from '@/solution/pages/LessonPlansPage';
import { LessonEditorPage } from '@/solution/pages/LessonEditorPage';
import { CoachPreparationPage } from '@/solution/pages/CoachPreparationPage';
import { CoachPreviewPage } from '@/solution/pages/CoachPreviewPage';
import { StudentPortalPage } from '@/solution/pages/StudentPortalPage';
import { CoachPlayerPage } from '@/solution/pages/CoachPlayerPage';
import { TemplatesPage } from '@/solution/pages/TemplatesPage';
import { SharedPlansPage } from '@/solution/pages/SharedPlansPage';
import { IntegrationPage } from '@/solution/pages/IntegrationPage';
import { ReportsPage } from '@/solution/pages/ReportsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<LessonWorkspaceLayout />}>
          <Route index element={<Navigate to="/lesson-plans" replace />} />
          <Route path="/classes" element={<MyClassesPage />} />
          <Route path="/classes/:classId" element={<ClassSummaryPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/unit-plans" element={<UnitPlansPage />} />
          <Route path="/lesson-plans" element={<LessonPlansPage />} />
          <Route path="/lesson-plans/new" element={<LessonEditorPage mode="new" />} />
          <Route path="/lesson-plans/:lessonId" element={<LessonEditorPage />} />
          <Route path="/lesson-plans/:lessonId/coach" element={<CoachPreparationPage />} />
          <Route path="/lesson-plans/:lessonId/preview" element={<CoachPreviewPage />} />
          <Route path="/lesson-plans/templates" element={<TemplatesPage />} />
          <Route path="/lesson-plans/shared" element={<SharedPlansPage />} />
          <Route path="/student-learning" element={<StudentPortalPage />} />
          <Route path="/student-learning/:lessonId" element={<CoachPlayerPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/lesson-plans" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
