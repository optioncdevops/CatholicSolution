import { NavLink, Outlet } from 'react-router-dom';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';

const app = getAppById('ai-lesson-plan')!;

const primaryNav = [
  { to:'/classes', label:'My Classes' },
  { to:'/calendar', label:'Calendar' },
  { to:'/unit-plans', label:'Unit Plans' },
  { to:'/lesson-plans', label:'Lesson Plans' },
  { to:'/reports', label:'Reports' },
];

export function LessonWorkspaceLayout() {
  return (
    <AppLayout app={app} className="bg-[#eef3f8]">
      <div className="lesson-workspace-shell">
        <div className="lesson-workspace-nav-wrap">
          <nav className="lesson-workspace-nav" aria-label="Lesson Plan modules">
            {primaryNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }: { isActive: boolean }) => isActive ? 'is-active' : undefined}>{item.label}</NavLink>
            ))}
          </nav>
          <div className="lesson-workspace-nav__utilities">
            <NavLink to="/student-learning">Student portal</NavLink>
            <NavLink to="/integration">Integration</NavLink>
          </div>
        </div>
        <Outlet />
      </div>
    </AppLayout>
  );
}
