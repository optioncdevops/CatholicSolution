import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { units } from '../lessonPlanData';

export function UnitPlansPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(units[0].id);
  const unit = units.find((item) => item.id === selected) ?? units[0];
  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="Curriculum planning" title="Unit Plans" status={<span className="lesson-count-badge">{units.length} active units</span>} actions={<button type="button" className="action-primary" onClick={() => navigate('/lesson-plans/new')}>Add lesson</button>}/>
    <section className="lesson-unit-layout">
      <aside className="lesson-panel lesson-unit-list"><header><span>Active units</span><strong>Term 1</strong></header>{units.map((item) => <button type="button" key={item.id} className={selected === item.id ? 'is-active' : ''} onClick={() => setSelected(item.id)}><strong>{item.title}</strong><span>{item.course} · {item.grade}</span><small>{item.dateRange}</small></button>)}</aside>
      <section className="lesson-panel lesson-unit-detail">
        <header className="lesson-panel-heading"><div><span>{unit.course} · {unit.grade}</span><h2>{unit.title}</h2><p>{unit.dateRange} · Unit → Calendar → Lesson → XtraCoach → Assessment</p></div><button type="button" className="action-secondary" onClick={() => navigate('/lesson-plans')}>Go to lesson plans</button></header>
        <div className="lesson-unit-sequence">{unit.lessons.map((lesson,index) => <article key={lesson.id}><span className="lesson-unit-sequence__step">{index+1}</span><div><strong>{lesson.title}</strong><span>{lesson.date}</span></div><b className={`lesson-unit-status lesson-unit-status--${lesson.status.toLowerCase().replace(' ','-')}`}>{lesson.status}</b><button type="button" onClick={() => lesson.id.startsWith('lp-1') ? navigate(`/lesson-plans/${lesson.id}`) : navigate('/lesson-plans/new')}>{lesson.status === 'Not created' ? 'Create' : 'Open'}</button></article>)}</div>
        <div className="lesson-timeline"><h3>Instructional timeline</h3><div><span><b>Aug 10</b>Introduction</span><span><b>Aug 11–18</b>Concept development</span><span><b>Aug 19–27</b>Application & practice</span><span><b>Aug 28</b>Assessment</span></div></div>
      </section>
    </section>
  </main>;
}
