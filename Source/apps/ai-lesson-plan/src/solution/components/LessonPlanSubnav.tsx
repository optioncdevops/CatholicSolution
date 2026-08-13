import { NavLink } from 'react-router-dom';

const tabs = [
  { to:'/lesson-plans', label:'View', end:true },
  { to:'/lesson-plans/new', label:'Add' },
  { to:'/lesson-plans/templates', label:'Templates' },
  { to:'/lesson-plans/shared', label:'Shared with me' },
  { to:'/unit-plans', label:'Go to Unit Plans' },
];

export function LessonPlanSubnav() {
  return (
    <nav className="lesson-subnav" aria-label="Lesson Plan actions">
      {tabs.map((tab) => <NavLink key={tab.to} to={tab.to} end={tab.end} className={({isActive}: { isActive: boolean }) => isActive ? 'is-active' : undefined}>{tab.label}</NavLink>)}
    </nav>
  );
}
