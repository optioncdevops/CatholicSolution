import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@shared/app/components/DashboardHeader';
import { lessons } from '../lessonPlanData';

type CalendarMode = 'day' | 'week' | 'month';
const weekDays = [
  ['2026-08-10','Mon','10'],['2026-08-11','Tue','11'],['2026-08-12','Wed','12'],['2026-08-13','Thu','13'],['2026-08-14','Fri','14'],
] as const;

export function CalendarPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CalendarMode>('week');
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const dayLessons = useMemo(() => lessons.filter((item) => item.startDate <= selectedDate && item.endDate >= selectedDate), [selectedDate]);
  return <main className="dashboard-content dashboard-stack lesson-screen">
    <DashboardHeader eyebrow="Teaching calendar" title="Calendar" status={<span className="lesson-count-badge">Week of Aug 10</span>}/>
    <section className="lesson-panel">
      <header className="lesson-panel-heading"><div><span>Lesson schedule</span><h2>August 2026</h2><p>Lesson dates stay connected to your planning workspace.</p></div><div className="lesson-tabs lesson-tabs--compact">{(['day','week','month'] as CalendarMode[]).map((item) => <button type="button" key={item} className={mode === item ? 'is-active' : ''} onClick={() => setMode(item)}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div></header>
      {mode === 'week' ? <div className="lesson-calendar-week">{weekDays.map(([date,day,num]) => <article key={date} className={selectedDate === date ? 'is-active' : ''}><button className="lesson-calendar-day-head" type="button" onClick={() => setSelectedDate(date)}><span>{day}</span><strong>{num}</strong></button><div className="lesson-calendar-events">{lessons.filter((item) => item.startDate <= date && item.endDate >= date).slice(0,4).map((item) => <button type="button" key={item.id} onClick={() => navigate(`/lesson-plans/${item.id}`)}><span>{item.course}</span><strong>{item.title}</strong><small>{item.duration} min · {item.teacher}</small></button>)}</div></article>)}</div> : mode === 'day' ? <DaySchedule rows={dayLessons} onOpen={(id) => navigate(`/lesson-plans/${id}`)}/> : <MonthGrid onSelect={(date) => { setSelectedDate(date); setMode('day'); }}/>} 
    </section>
  </main>;
}

function DaySchedule({ rows, onOpen }: { rows: typeof lessons; onOpen:(id:string)=>void }) {
  return <div className="lesson-day-schedule"><aside>{['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'].map((time) => <span key={time}>{time}</span>)}</aside><div className="lesson-day-schedule__content">{rows.length ? rows.map((item,index) => <button key={item.id} type="button" style={{ marginTop: `${index * 12}px` }} onClick={() => onOpen(item.id)}><span>{item.course} · {item.duration} minutes</span><strong>{item.title}</strong><small>{item.teacher}</small></button>) : <div className="lesson-empty-state"><strong>No lessons scheduled</strong><span>Select another day or add a lesson plan.</span></div>}</div></div>;
}

function MonthGrid({ onSelect }: { onSelect:(date:string)=>void }) {
  const days = Array.from({length:31},(_,i) => i+1);
  return <div className="lesson-month-grid"><div className="lesson-month-grid__labels">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <span key={day}>{day}</span>)}</div><div className="lesson-month-grid__days">{Array.from({length:6},(_,i) => <span key={`blank-${i}`} className="is-blank"/>)}{days.map((day) => { const date=`2026-08-${String(day).padStart(2,'0')}`; const count=lessons.filter((item) => item.startDate <= date && item.endDate >= date).length; return <button type="button" key={day} onClick={() => onSelect(date)}><strong>{day}</strong>{count ? <span>{count} lesson{count>1?'s':''}</span> : null}</button>; })}</div></div>;
}