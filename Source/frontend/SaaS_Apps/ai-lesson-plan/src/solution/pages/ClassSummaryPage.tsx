import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { classes } from '../lessonPlanData';

type Tab = 'general' | 'grading' | 'coach';

export function ClassSummaryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { classId } = useParams();
  const [tab, setTab] = useState<Tab>('general');
  const item = classes.find((row) => row.id === classId) ?? classes[0];
  const general = [['Teacher', item.teacher],['Course', item.course],['Grade', item.grade],['Section', item.section || '—'],['Enrollment', String(item.enrollment)],['Homeroom', item.homeroom ? 'Yes' : 'No']];
  const grading = [['Grade calculation','Assignment % average'],['Default grade type','Numeric'],['Default numeric points','100'],['Post assignment grades','Yes'],['Report cards',item.reportCards ? 'Enabled' : 'Not enabled'],['Progress report',item.progressReport ? 'Enabled' : 'Not enabled']];

  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="My Classes · Class summary" title={item.name} actions={<div className="lesson-header-actions"><button className="action-secondary" type="button" onClick={() => navigate('/classes')}>Back to classes</button><button className="action-secondary" type="button" onClick={() => showToast('Class report prepared')}>Class report</button></div>}/>
    <section className="lesson-panel">
      <div className="lesson-tabs" role="tablist"><button type="button" className={tab === 'general' ? 'is-active' : ''} onClick={() => setTab('general')}>General</button><button type="button" className={tab === 'grading' ? 'is-active' : ''} onClick={() => setTab('grading')}>Assignments & grading</button><button type="button" className={tab === 'coach' ? 'is-active' : ''} onClick={() => setTab('coach')}>XtraCoach</button></div>
      {tab !== 'coach' ? <div className="lesson-detail-grid">{(tab === 'general' ? general : grading).map(([label,value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div> : <div className="lesson-callout lesson-callout--coach"><div><span className="lesson-kicker">AI learning companion</span><h2>XtraCoach is separated from grading</h2><p>Lesson preparation and adaptive practice support learning. Teacher grade calculations remain in the school system and are not changed by XtraCoach.</p></div><button type="button" className="action-primary" onClick={() => navigate('/lesson-plans/lp-105/coach')}>Open lesson preparation</button></div>}
      <div className="lesson-action-row"><button type="button" className="action-secondary" onClick={() => showToast('Edit class opened for service integration')}>Edit</button><button type="button" className="action-secondary" onClick={() => showToast('Delete requires server confirmation')}>Delete</button></div>
    </section>
  </main>;
}
