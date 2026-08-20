import { type ChangeEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { classes, lessonTeachers } from '../lessonPlanData';
import { FilterField } from '../components/FilterField';

export function MyClassesPage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('Quarter 1');
  const [teacher, setTeacher] = useState('');
  const [grade, setGrade] = useState('');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => classes.filter((item) => (!teacher || item.teacher === teacher) && (!grade || item.grade === grade) && (!query.trim() || `${item.name} ${item.course} ${item.teacher}`.toLowerCase().includes(query.toLowerCase()))), [teacher, grade, query]);
  const grades = [...new Set(classes.map((item) => item.grade))];

  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="Teaching workspace" title="My Classes" status={<span className="lesson-count-badge">{rows.length} classes</span>} actions={<button className="action-primary" type="button" onClick={() => navigate('/lesson-plans/new')}>Add lesson plan</button>}/>
    <section className="lesson-panel">
      <div className="lesson-toolbar lesson-toolbar--filters">
        <FilterField label="Term" value={term} onChange={setTerm} options={['Quarter 1','Quarter 2','Quarter 3','Quarter 4']}/>
        <FilterField label="Teacher" value={teacher} onChange={setTeacher} options={lessonTeachers} allLabel="All teachers"/>
        <FilterField label="Grade" value={grade} onChange={setGrade} options={grades} allLabel="All grades"/>
        <label className="lesson-field lesson-field--search"><span>Search classes</span><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="Class, course, or teacher"/></label>
      </div>
      <div className="lesson-table-scroll">
        <table className="lesson-enterprise-table lesson-enterprise-table--classes">
          <thead><tr><th>Class name</th><th>Section</th><th>Course name</th><th>Teacher</th><th>Enrollment</th><th>Skills</th><th>Homeroom</th><th>Report cards</th><th>Progress report</th></tr></thead>
          <tbody>{rows.map((item) => <tr key={item.id} onClick={() => navigate(`/classes/${item.id}`)} className="is-clickable"><td><strong>{item.name}</strong><span>{item.grade}</span></td><td>{item.section || '—'}</td><td>{item.course}</td><td>{item.teacher}</td><td>{item.enrollment}</td><td>{item.skills}</td><td>{item.homeroom ? 'Yes' : 'No'}</td><td>{item.reportCards ? 'Yes' : 'No'}</td><td>{item.progressReport ? 'Yes' : 'No'}</td></tr>)}</tbody>
        </table>
      </div>
      <footer className="lesson-panel-footer"><span>Showing {rows.length} of {classes.length} classes · {term}</span></footer>
    </section>
  </main>;
}