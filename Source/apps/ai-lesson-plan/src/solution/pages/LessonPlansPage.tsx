import { type ChangeEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { FilterField } from '../components/FilterField';
import { LessonPlanSubnav } from '../components/LessonPlanSubnav';
import { LessonStatusBadge } from '../components/LessonStatusBadge';
import { lessonCourses, lessonGrades, lessonTeachers, lessons } from '../lessonPlanData';

type ViewMode = 'week' | 'day' | 'list';
const dates = [
  ['2026-08-10','Monday 08/10'],['2026-08-11','Tuesday 08/11'],['2026-08-12','Wednesday 08/12'],['2026-08-13','Thursday 08/13'],['2026-08-14','Friday 08/14'],
] as const;

export function LessonPlansPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view,setView] = useState<ViewMode>('week');
  const [term,setTerm] = useState('Trimester 1');
  const [week,setWeek] = useState('2026-08-10');
  const [grade,setGrade] = useState('');
  const [course,setCourse] = useState('');
  const [teacher,setTeacher] = useState('');
  const [query,setQuery] = useState('');
  const [bulkOpen,setBulkOpen] = useState(false);
  const [pageSize,setPageSize] = useState('25');
  const filtered = useMemo(() => lessons.filter((item) => item.weekStart === week && (!grade || item.grade===grade) && (!course || item.course===course) && (!teacher || item.teacher===teacher) && (!query.trim() || `${item.title} ${item.course} ${item.teacher}`.toLowerCase().includes(query.toLowerCase()))),[week,grade,course,teacher,query]);
  const shiftWeek = (days:number) => { const current=new Date(`${week}T00:00:00`); current.setDate(current.getDate()+days); setWeek(current.toISOString().slice(0,10)); };

  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="Teaching & planning" title="Lesson Plan" status={<span className="lesson-count-badge">{filtered.length} plans</span>}/>
    <LessonPlanSubnav/>
    <section className="lesson-panel">
      <header className="lesson-panel-heading lesson-panel-heading--plans"><div><span>View lesson plan</span><h2>{view === 'week' ? 'Week View' : view === 'day' ? 'Day View' : 'List View'}</h2><p>{view === 'list' ? 'July 15 – November 10, 2026' : 'Monday, August 10 – Friday, August 14, 2026'}</p></div><div className="lesson-plans-actions"><button type="button" className="action-primary" onClick={() => navigate('/lesson-plans/new')}>Generate new lesson plan</button><button type="button" className="action-secondary" onClick={() => setBulkOpen((value) => !value)}>Bulk generation</button></div></header>
      <div className="lesson-tabs lesson-tabs--view" role="tablist">{(['week','day','list'] as ViewMode[]).map((item) => <button type="button" key={item} className={view === item ? 'is-active' : ''} onClick={() => setView(item)}>{item[0].toUpperCase()+item.slice(1)} View</button>)}</div>
      {bulkOpen ? <BulkGenerator onClose={() => setBulkOpen(false)} onGenerate={() => { setBulkOpen(false); showToast('Planning draft generated and added to the lesson queue'); }}/>: null}
      <div className="lesson-toolbar lesson-toolbar--filters lesson-toolbar--reference">
        <FilterField label="Select a term" value={term} onChange={setTerm} options={['Trimester 1','Trimester 2','Trimester 3']}/>
        <label className="lesson-field"><span>Week starting from</span><input type="date" value={week} onChange={(event: ChangeEvent<HTMLInputElement>) => setWeek(event.target.value)}/></label>
        <FilterField label="Grade" value={grade} onChange={setGrade} options={lessonGrades} allLabel="All grades"/>
        <FilterField label="Course name" value={course} onChange={setCourse} options={lessonCourses} allLabel="All courses"/>
        <FilterField label="Teacher" value={teacher} onChange={setTeacher} options={lessonTeachers} allLabel="All teachers"/>
      </div>
      <div className="lesson-reference-actions"><div className="lesson-week-navigation"><button type="button" onClick={()=>shiftWeek(-7)}>‹ Previous week</button><span>{formatDate(week)}</span><button type="button" onClick={()=>shiftWeek(7)}>Next week ›</button></div><div className="lesson-export-actions"><span>Export:</span><button type="button" onClick={()=>window.print()}>Print</button><button type="button" onClick={()=>showToast('Lesson-plan CSV export prepared')}>CSV</button></div></div>
      <div className="lesson-table-tools"><label className="lesson-records-control"><select value={pageSize} onChange={(event:ChangeEvent<HTMLSelectElement>)=>setPageSize(event.target.value)}><option>10</option><option>25</option><option>50</option></select><span>records</span></label><span>Showing {Math.min(Number(pageSize),filtered.length)} of {filtered.length}</span><label><span className="sr-only">Search lesson plans</span><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>)=>setQuery(event.target.value)} placeholder="Search lesson plans"/></label></div>
      {view === 'week' ? <WeekView rows={filtered} onOpen={(id)=>navigate(`/lesson-plans/${id}`)}/> : view === 'day' ? <DayView rows={filtered} onOpen={(id)=>navigate(`/lesson-plans/${id}`)}/> : <ListView rows={filtered.slice(0,Number(pageSize))} onOpen={(id)=>navigate(`/lesson-plans/${id}`)}/>} 
    </section>
  </main>;
}

function WeekView({ rows, onOpen }: { rows: typeof lessons; onOpen:(id:string)=>void }) {
  const courses = [...new Set(rows.map((item) => item.course))];
  return <div className="lesson-table-scroll"><table className="lesson-enterprise-table lesson-week-table"><thead><tr><th>Course name</th><th>Grade</th>{dates.map(([,label])=><th key={label}>{label}</th>)}</tr></thead><tbody>{courses.length ? courses.map((course)=>{const courseRows=rows.filter((item)=>item.course===course); const first=courseRows[0]; return <tr key={course}><td><strong>{course}</strong><span>{first?.teacher}</span></td><td>{first?.grade}</td>{dates.map(([date])=>{const matches=courseRows.filter((item)=>item.startDate<=date && item.endDate>=date);return <td key={date}>{matches.map((item)=><button type="button" className="lesson-cell-link" key={item.id} onClick={()=>onOpen(item.id)}>{item.title}</button>)}</td>})}</tr>}) : <tr><td colSpan={7}><div className="lesson-empty-table"><strong>No lesson plans found for this week</strong><span>Change the week or filters, or generate a new lesson plan.</span></div></td></tr>}</tbody></table></div>;
}

function DayView({ rows, onOpen }: { rows: typeof lessons; onOpen:(id:string)=>void }) {
  const day='2026-08-12'; const dayRows=rows.filter((item)=>item.startDate<=day && item.endDate>=day);
  return <div className="lesson-table-scroll"><table className="lesson-enterprise-table"><thead><tr><th>Saved date</th><th>Course name</th><th>Grade</th><th>Teacher</th><th>Lesson title</th><th>Status</th></tr></thead><tbody>{dayRows.map((item)=><tr key={item.id} className="is-clickable" onClick={()=>onOpen(item.id)}><td>08/12/2026</td><td>{item.course}</td><td>{item.grade}</td><td>{item.teacher}</td><td><strong>{item.title}</strong><span>{item.unit}</span></td><td><LessonStatusBadge status={item.status}/></td></tr>)}</tbody></table></div>;
}

function ListView({ rows, onOpen }: { rows: typeof lessons; onOpen:(id:string)=>void }) {
  return <div className="lesson-table-scroll"><table className="lesson-enterprise-table"><thead><tr><th>Start date</th><th>End date</th><th>Course name</th><th>Grade</th><th>Teacher</th><th>Title</th><th>Status</th></tr></thead><tbody>{rows.map((item)=><tr key={item.id}><td>{formatDate(item.startDate)}</td><td>{formatDate(item.endDate)}</td><td>{item.course}</td><td>{item.grade}</td><td>{item.teacher}</td><td><button className="lesson-title-link" type="button" onClick={()=>onOpen(item.id)}>{item.title}</button></td><td><LessonStatusBadge status={item.status}/></td></tr>)}</tbody></table></div>;
}

function BulkGenerator({ onClose, onGenerate }: { onClose:()=>void; onGenerate:()=>void }) {
  const [scope,setScope]=useState('Academic Year');
  return <div className="lesson-bulk-panel"><header><div><span>AI planning assistant</span><h3>Lesson Plan Bulk Generation</h3><p>Create a planning draft across a day, unit, or academic year. Existing plans remain unchanged.</p></div><button type="button" onClick={onClose} aria-label="Close bulk generation">×</button></header><div className="lesson-tabs lesson-tabs--compact">{['Single Day','Unit (Week)','Academic Year'].map((item)=><button type="button" key={item} className={scope===item?'is-active':''} onClick={()=>setScope(item)}>{item}</button>)}</div><div className="lesson-bulk-fields"><BulkSelect label="Grade" value="3" options={['1','2','3','4','5','6','7','8']}/><BulkSelect label="Course" value="Math 3" options={['Math 3','Science 3','English 3']}/><BulkSelect label="Term" value="Term 1" options={['All term','Term 1','Term 2','Term 3']}/><BulkSelect label="Class duration" value="45 minutes per day" options={['30 minutes per day','45 minutes per day','60 minutes per day']}/><BulkSelect label="Instructional days" value="5 days/week" options={['4 days/week','5 days/week','6 days/week']}/><label><span>Start date</span><input type="date" defaultValue="2026-08-10"/></label><label><span>Total lessons</span><input defaultValue="50" inputMode="numeric"/></label></div><footer><span>{scope} · review generated units and lessons before publishing</span><div><button type="button" className="action-secondary" onClick={onClose}>Cancel</button><button type="button" className="action-primary" onClick={onGenerate}>Generate planning draft</button></div></footer></div>;
}
function BulkSelect({label,value,options}:{label:string;value:string;options:string[]}){return <label><span>{label}</span><select defaultValue={value}>{options.map((item)=><option key={item}>{item}</option>)}</select></label>}
function formatDate(value:string){const [year,month,day]=value.split('-');return `${month}/${day}/${year}`;}
