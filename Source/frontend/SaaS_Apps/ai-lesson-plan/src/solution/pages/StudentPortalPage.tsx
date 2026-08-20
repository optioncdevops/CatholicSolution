import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { lessons } from '../lessonPlanData';

export function StudentPortalPage(){
  const navigate=useNavigate();
  const available=lessons.filter((item)=>item.prepared).slice(0,5);
  return <main className="dashboard-content dashboard-stack lesson-screen"><DashboardHeader eyebrow="Student portal" title="My Learning" status={<span className="lesson-count-badge">{available.length} available lessons</span>}/><section className="lesson-student-grid">{available.map((lesson)=><article className="lesson-student-card" key={lesson.id}><header><span>{lesson.course} · {lesson.grade}</span><b>{lesson.status==='Ready'?'Ready to learn':'Available'}</b></header><h2>{lesson.title}</h2><p>Unit: {lesson.unit} · Teacher: {lesson.teacher}</p><div className="lesson-student-progress"><span>Learning path</span><strong>Orientation → Level 1 → Level 2 → Level 3 → Mastery</strong></div><button type="button" className="action-primary" onClick={()=>navigate(`/student-learning/${lesson.id}`)}>Start with XtraCoach</button></article>)}</section></main>
}
