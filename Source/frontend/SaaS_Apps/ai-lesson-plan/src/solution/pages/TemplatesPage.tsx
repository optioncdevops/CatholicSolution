import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { LessonPlanSubnav } from '../components/LessonPlanSubnav';
import { templates } from '../lessonPlanData';

export function TemplatesPage(){const navigate=useNavigate();const {showToast}=useToast();return <main className="dashboard-content dashboard-stack lesson-screen"><DashboardHeader eyebrow="Lesson Plan · Reusable content" title="Templates" status={<span className="lesson-count-badge">{templates.length} templates</span>}/><LessonPlanSubnav/><section className="lesson-panel"><header className="lesson-panel-heading"><div><span>Template library</span><h2>Start from a proven structure</h2><p>Reuse a lesson framework, then customize it for the class, unit, and teaching objective.</p></div></header><div className="lesson-template-grid">{templates.map((item)=><article key={item.id}><span>{item.subject}</span><h3>{item.name}</h3><p>{item.grade} · Updated {item.updated}</p><div><button type="button" className="action-secondary" onClick={()=>showToast(`${item.name} preview opened`)}>Preview</button><button type="button" className="action-primary" onClick={()=>navigate('/lesson-plans/new')}>Use template</button></div></article>)}</div></section></main>}
