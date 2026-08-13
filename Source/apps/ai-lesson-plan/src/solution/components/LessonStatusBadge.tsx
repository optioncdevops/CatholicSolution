import type { LessonRecord } from '../lessonPlanData';

export function LessonStatusBadge({ status }: { status: LessonRecord['status'] }) {
  return <span className={`lesson-status lesson-status--${status.toLowerCase()}`}>{status}</span>;
}
