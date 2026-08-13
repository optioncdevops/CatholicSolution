import { useNavigate, useParams } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { lessons } from '../lessonPlanData';

const steps=[
  ['Orientation','Photosynthesis is the process plants use to make food.','Start'],
  ['Level 1','Foundation question · pass or receive a simpler explanation and retry.','Foundation'],
  ['Level 2','Apply the concept · re-teach support appears when needed.','Application'],
  ['Level 3','Reasoning prompt · explain why photosynthesis matters in a food chain.','Reasoning'],
  ['Mastery','Concept mastery achieved. No scores, rankings, or badges.','Complete'],
];
export function CoachPreviewPage(){const navigate=useNavigate();const {lessonId}=useParams();const lesson=lessons.find((item)=>item.id===lessonId)??lessons[0];return <main className="dashboard-content dashboard-stack lesson-screen"><DashboardHeader eyebrow="XtraCoach preparation · Preview" title="Student experience preview" actions={<button type="button" className="action-secondary" onClick={()=>navigate(`/lesson-plans/${lesson.id}/coach`)}>Back to preparation</button>}/><section className="lesson-panel lesson-preview"><header><span>Lesson</span><h2>{lesson.title}</h2><p>Preview the adaptive flow before making it available to students.</p></header><div className="lesson-preview-flow">{steps.map(([title,body,label],index)=><article key={title}><div className="lesson-preview-step">{index===steps.length-1?'✓':index+1}</div><div><span>{label}</span><strong>{title}</strong><p>{body}</p></div>{index<steps.length-1?<i>→</i>:null}</article>)}</div><footer><button type="button" className="action-secondary" onClick={()=>navigate(`/lesson-plans/${lesson.id}`)}>Edit lesson</button><button type="button" className="action-primary" onClick={()=>navigate('/student-learning')}>Open student portal</button></footer></section></main>}
