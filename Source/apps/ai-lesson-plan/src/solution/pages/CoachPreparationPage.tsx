import { type ChangeEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { coachQuestions, lessons } from '../lessonPlanData';

export function CoachPreparationPage() {
  const navigate=useNavigate(); const {showToast}=useToast(); const {lessonId}=useParams();
  const lesson=lessons.find((item)=>item.id===lessonId) ?? lessons.find((item)=>item.id==='lp-105')!;
  const [level,setLevel]=useState<1|2|3>(1); const [approved,setApproved]=useState(false);
  const [questions,setQuestions]=useState<Record<number,string[]>>({1:[...coachQuestions[1]],2:[...coachQuestions[2]],3:[...coachQuestions[3]]});
  const update=(index:number,value:string)=>setQuestions((current)=>({...current,[level]:current[level].map((item,i)=>i===index?value:item)}));
  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="Lesson Plan · XtraCoach preparation" title={lesson.title} status={<span className={`lesson-availability ${approved?'is-ready':''}`}>{approved?'Available to students':'Draft preparation'}</span>} actions={<button type="button" className="action-secondary" onClick={()=>navigate(`/lesson-plans/${lesson.id}`)}>Back to lesson</button>}/>
    <section className="lesson-coach-layout">
      <aside className="lesson-panel lesson-context-card"><span className="lesson-kicker">Lesson context</span><h2>{lesson.title}</h2><dl><div><dt>Grade</dt><dd>{lesson.grade}</dd></div><div><dt>Course</dt><dd>{lesson.course}</dd></div><div><dt>Unit</dt><dd>{lesson.unit}</dd></div><div><dt>Teacher</dt><dd>{lesson.teacher}</dd></div></dl><p>Only approved lesson information is used to prepare the learning path.</p></aside>
      <section className="lesson-panel lesson-coach-prep"><header className="lesson-panel-heading"><div><span>AI learning companion</span><h2>XtraCoach learning path</h2><p>Review the question sequence teachers will make available to students.</p></div><button type="button" className="action-secondary" onClick={()=>navigate(`/lesson-plans/${lesson.id}/preview`)}>Preview student experience</button></header>
        <div className="lesson-level-tabs">{([1,2,3] as const).map((item)=><button type="button" key={item} className={level===item?'is-active':''} onClick={()=>setLevel(item)}><span>Level {item}</span><small>{item===1?'Foundation':item===2?'Application':'Reasoning'}</small></button>)}</div>
        <div className="lesson-question-editor">{questions[level].map((question,index)=><label key={`${level}-${index}`}><span><b>Q{index+1}</b>{index===0?'Primary question':'Retry / re-teach pool'}</span><textarea rows={3} value={question} onChange={(event: ChangeEvent<HTMLTextAreaElement>)=>update(index,event.target.value)}/><small>{index===0 ? (level===1?'Multiple choice':level===2?'Free response':'Analysis prompt') : 'Editable alternative question'}</small></label>)}</div>
        {level===3?<div className="lesson-note">Level 3 re-teach path is not configured. Teachers can add it later without changing the lesson plan.</div>:null}
        <footer className="lesson-coach-footer"><span>{approved?'Approved and visible in Student Portal':'Save edits before approving student access.'}</span><div><button type="button" className="action-secondary" onClick={()=>showToast('XtraCoach preparation saved')}>Save</button><button type="button" className="action-primary" onClick={()=>{setApproved(true);showToast('Lesson approved and available to students');}}>Approve & make available</button></div></footer>
      </section>
    </section>
  </main>;
}