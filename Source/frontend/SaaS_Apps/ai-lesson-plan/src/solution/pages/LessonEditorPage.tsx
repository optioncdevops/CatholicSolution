import { type ChangeEvent, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { LessonPlanSubnav } from '../components/LessonPlanSubnav';
import { lessonCourses, lessonGrades, lessonSectionDefaults, lessonSections, lessonTeachers, lessons } from '../lessonPlanData';

export function LessonEditorPage({ mode = 'view' }: { mode?: 'view' | 'new' }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { lessonId } = useParams();
  const source = lessons.find((item) => item.id === lessonId) ?? lessons.find((item) => item.id === 'lp-105')!;
  const isNew = mode === 'new';
  const [teacher,setTeacher] = useState(isNew ? lessonTeachers[0] : source.teacher);
  const [grade,setGrade] = useState(isNew ? lessonGrades[0] : source.grade);
  const [course,setCourse] = useState(isNew ? lessonCourses[0] : source.course);
  const [title,setTitle] = useState(isNew ? '' : source.title);
  const [unit,setUnit] = useState(isNew ? '' : source.unit);
  const [dateFrom,setDateFrom] = useState(isNew ? '2026-08-17' : source.startDate);
  const [dateTo,setDateTo] = useState(isNew ? '2026-08-17' : source.endDate);
  const [duration,setDuration] = useState(isNew ? '45' : String(source.duration));
  const [generated,setGenerated] = useState(!isNew);
  const [sectionValues,setSectionValues] = useState<Record<string,string>>(() => Object.fromEntries(lessonSections.map((section) => [section,lessonSectionDefaults[section]])));
  const lessonKey = isNew ? 'lp-105' : source.id;
  const completeness = useMemo(() => Math.round(Object.values(sectionValues).filter((value)=>value.trim()).length / lessonSections.length * 100),[sectionValues]);

  const updateSection = (key:string,value:string) => setSectionValues((current)=>({...current,[key]:value}));
  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="Lesson Plan · Editor" title={isNew ? 'Generate New Lesson Plan' : source.title} status={<span className="lesson-count-badge">{completeness}% complete</span>}/>
    <LessonPlanSubnav/>
    <section className="lesson-panel lesson-editor">
      <div className="lesson-editor-required">* indicates a required field</div>
      <div className="lesson-editor-basics">
        <EditorSelect label="Teacher's name" required value={teacher} onChange={setTeacher} options={lessonTeachers}/>
        <EditorSelect label="Grade" required value={grade} onChange={setGrade} options={lessonGrades}/>
        <EditorSelect label="Course" required value={course} onChange={setCourse} options={lessonCourses}/>
        <EditorInput label="Lesson title" required value={title} onChange={setTitle} placeholder="Enter lesson title"/>
        <EditorInput label="Unit" value={unit} onChange={setUnit} placeholder="Unit or topic"/>
        <EditorInput label="Date from" required value={dateFrom} onChange={setDateFrom} type="date"/>
        <EditorInput label="Date to" required value={dateTo} onChange={setDateTo} type="date"/>
        <EditorInput label="Duration" required value={duration} onChange={setDuration} type="number" suffix="Minutes"/>
        <EditorSelect label="Standard type" value="NGSS / State standard" onChange={()=>undefined} options={['NGSS / State standard','Diocesan standard','School standard']}/>
      </div>
      <div className="lesson-ai-generator">
        <div><span>AI planning assistant</span><strong>{generated ? 'Lesson sections are ready for review' : 'Generate the full lesson structure from the basics above'}</strong><p>{generated ? 'Review and edit all 19 sections before saving or preparing the lesson for XtraCoach.' : 'The assistant creates a planning draft. Nothing is published until you save it.'}</p></div>
        <button type="button" className="action-primary" disabled={!title.trim()} onClick={() => { setGenerated(true); showToast('19 lesson sections generated for review'); }}>{generated ? 'Regenerate sections' : 'Generate lesson sections'}</button>
      </div>
      {generated ? <div className="lesson-editor-sections">{lessonSections.map((section,index)=><label key={section} className="lesson-editor-section"><span><b>{index+1}</b>{section}</span><textarea value={sectionValues[section]} onChange={(event: ChangeEvent<HTMLTextAreaElement>)=>updateSection(section,event.target.value)} rows={section === 'Vocabulary' ? 4 : 3}/></label>)}</div> : null}
      <footer className="lesson-editor-footer"><div><button type="button" className="action-secondary" onClick={()=>navigate('/lesson-plans')}>Cancel</button><button type="button" className="action-secondary" onClick={()=>showToast('Lesson sharing options opened')}>Share lesson plan</button></div><div><button type="button" className="action-secondary" onClick={()=>showToast('Lesson plan saved')}>Save</button><button type="button" className="action-primary" disabled={!generated} onClick={()=>navigate(`/lesson-plans/${lessonKey}/coach`)}>Prepare with XtraCoach</button></div></footer>
    </section>
  </main>;
}

function EditorInput({label,value,onChange,required,type='text',placeholder,suffix}:{label:string;value:string;onChange:(value:string)=>void;required?:boolean;type?:string;placeholder?:string;suffix?:string}){
  return <label className="lesson-field"><span>{label}{required?<b className="lesson-required"> *</b>:null}</span><div className="lesson-input-with-suffix"><input type={type} value={value} onChange={(event: ChangeEvent<HTMLInputElement>)=>onChange(event.target.value)} placeholder={placeholder}/>{suffix?<em>{suffix}</em>:null}</div></label>;
}
function EditorSelect({label,value,onChange,options,required}:{label:string;value:string;onChange:(value:string)=>void;options:string[];required?:boolean}){
  return <label className="lesson-field"><span>{label}{required?<b className="lesson-required"> *</b>:null}</span><select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>)=>onChange(event.target.value)}>{options.map((item)=><option key={item}>{item}</option>)}</select></label>;
}