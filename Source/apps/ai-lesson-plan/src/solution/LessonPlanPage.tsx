import { useMemo, useState } from 'react';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { lessonCourses, lessonGrades, lessonPlanRecords, lessonTeachers, type LessonPlanRecord } from './lessonPlanData';

const app = getAppById('ai-lesson-plan')!;
type ViewMode = 'week' | 'day' | 'list';
const weekdays = [
  ['monday','Monday 08/10/2026'], ['tuesday','Tuesday 08/11/2026'], ['wednesday','Wednesday 08/12/2026'],
  ['thursday','Thursday 08/13/2026'], ['friday','Friday 08/14/2026'],
] as const;
const topTabs = ['View','Add','Templates','Shared with me','Unit Plans'] as const;

export function LessonPlanPage() {
  const { showToast } = useToast();
  const [view, setView] = useState<ViewMode>('week');
  const [term, setTerm] = useState('Trimester 1');
  const [weekStart, setWeekStart] = useState('2026-08-10');
  const [grade, setGrade] = useState('');
  const [course, setCourse] = useState('');
  const [teacher, setTeacher] = useState('');
  const [query, setQuery] = useState('');
  const records = useMemo(() => lessonPlanRecords.filter((item) => item.term === term && item.weekStart === weekStart && (!grade || item.grade === grade) && (!course || item.course === course) && (!teacher || item.teacher === teacher) && (!query.trim() || [item.course,item.grade,item.teacher,...Object.values(item.lessons)].join(' ').toLowerCase().includes(query.trim().toLowerCase()))), [term,weekStart,grade,course,teacher,query]);
  const announce = (label: string) => showToast(`${label} workspace is ready for service integration`);

  return (
    <AppLayout app={app} className="bg-[#eef3f8]">
      <main className="dashboard-content dashboard-stack lesson-plan-page">
        <DashboardHeader eyebrow="Teaching & planning" title="Lesson Plan" status={<span className="lesson-plan-status">{records.length} plans this week</span>}/>
        <nav className="lesson-plan-primary-nav" aria-label="Lesson plan workspace">
          {topTabs.map((tab) => <button key={tab} type="button" className={tab === 'View' ? 'is-active' : ''} onClick={() => tab === 'View' ? setView('week') : announce(tab)}>{tab}</button>)}
        </nav>
        <section className="lesson-plan-card">
          <header className="lesson-plan-card__head">
            <div><span>View lesson plans</span><strong>Week of August 10–14, 2026</strong></div>
            <div className="lesson-plan-view-tabs" role="tablist">
              <button type="button" className={view === 'week' ? 'is-active' : ''} onClick={() => setView('week')}>Week View</button>
              <button type="button" className={view === 'day' ? 'is-active' : ''} onClick={() => setView('day')}>Day View</button>
              <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>List View</button>
            </div>
          </header>
          <div className="lesson-plan-filter-grid">
            <Filter label="Term" value={term} onChange={setTerm} options={['Trimester 1']}/>
            <label><span>Week starting from</span><input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)}/></label>
            <Filter label="Grade" value={grade} onChange={setGrade} options={lessonGrades} all="All grades"/>
            <Filter label="Course name" value={course} onChange={setCourse} options={lessonCourses} all="All courses"/>
            <Filter label="Teacher" value={teacher} onChange={setTeacher} options={lessonTeachers} all="All teachers"/>
          </div>
          <div className="lesson-plan-table-tools">
            <span>{records.length} record{records.length === 1 ? '' : 's'}</span>
            <label><span className="sr-only">Search lesson plans</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lesson plans"/></label>
            <button type="button" onClick={() => showToast('Lesson-plan CSV export prepared')}>Export CSV</button>
          </div>
          {view === 'week' ? <WeekTable records={records}/> : view === 'day' ? <DayTable records={records}/> : <ListTable records={records}/>}
        </section>
      </main>
    </AppLayout>
  );
}

function Filter({ label, value, onChange, options, all }: { label: string; value: string; onChange: (value: string) => void; options: string[]; all?: string }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{all ? <option value="">{all}</option> : null}{options.map((item) => <option key={item}>{item}</option>)}</select></label>;
}
function WeekTable({ records }: { records: LessonPlanRecord[] }) { return <div className="lesson-plan-table-wrap"><table className="lesson-plan-table"><thead><tr><th>Course name</th><th>Grade</th>{weekdays.map(([,label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{records.map((item) => <tr key={item.id}><td><strong>{item.course}</strong><span>{item.teacher}</span></td><td>{item.grade}</td>{weekdays.map(([key]) => <td key={key}>{item.lessons[key]}</td>)}</tr>)}</tbody></table>{!records.length ? <Empty/> : null}</div>; }
function DayTable({ records }: { records: LessonPlanRecord[] }) { return <div className="lesson-plan-table-wrap"><table className="lesson-plan-table"><thead><tr><th>Course</th><th>Grade</th><th>Teacher</th><th>Wednesday 08/12/2026</th></tr></thead><tbody>{records.map((item) => <tr key={item.id}><td><strong>{item.course}</strong></td><td>{item.grade}</td><td>{item.teacher}</td><td>{item.lessons.wednesday}</td></tr>)}</tbody></table>{!records.length ? <Empty/> : null}</div>; }
function ListTable({ records }: { records: LessonPlanRecord[] }) { return <div className="lesson-plan-table-wrap"><table className="lesson-plan-table"><thead><tr><th>Course</th><th>Grade</th><th>Teacher</th><th>Lesson count</th><th>Week starting</th></tr></thead><tbody>{records.map((item) => <tr key={item.id}><td><strong>{item.course}</strong></td><td>{item.grade}</td><td>{item.teacher}</td><td>5 planned lessons</td><td>08/10/2026</td></tr>)}</tbody></table>{!records.length ? <Empty/> : null}</div>; }
function Empty() { return <div className="lesson-plan-empty"><strong>No lesson plans match these filters.</strong><span>Adjust the week, grade, course, teacher, or search text.</span></div>; }
