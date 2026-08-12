import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAppById } from '@shared/app/config/appCatalog';
import { AppLayout } from '@shared/app/layouts/AppLayout';
import { ArcAlertsNav, type ArcAlertsView } from '@/solution/components/ArcAlertsNav';
import { ArcAlertsHome } from '@/solution/components/ArcAlertsHome';
import { ArcAlertsAbout } from '@/solution/components/ArcAlertsAbout';
import { ArcAlertsNewAlert } from '@/solution/components/ArcAlertsNewAlert';
import { ArcAlertsList } from '@/solution/components/ArcAlertsList';
import { ArcAlertsMembers } from '@/solution/components/ArcAlertsMembers';
import { ArcAlertsGroups } from '@/solution/components/ArcAlertsGroups';
import { ArcAlertsSettings } from '@/solution/components/ArcAlertsSettings';
import { ArcAlertsPreferences } from '@/solution/components/ArcAlertsPreferences';
import { ArcAlertsBestPractices } from '@/solution/components/ArcAlertsBestPractices';

const app = getAppById('arc-alerts')!;
const pathByView: Record<ArcAlertsView, string> = {
  home: '',
  'new-alert': 'new-alert',
  alerts: 'alerts',
  members: 'members',
  groups: 'groups',
  about: 'about',
  settings: 'settings',
  preferences: 'preferences',
  'best-practices': 'best-practices',
};
const viewByPath = Object.fromEntries(Object.entries(pathByView).map(([view, path]) => [path, view])) as Record<string, ArcAlertsView>;

export function ArcAlertsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useMemo<ArcAlertsView>(() => {
    const suffix = location.pathname.replace(/^\//, '').split('/')[0] ?? '';
    return viewByPath[suffix] ?? 'home';
  }, [location.pathname]);

  const content = {
    home: <ArcAlertsHome />,
    'new-alert': <ArcAlertsNewAlert />,
    alerts: <ArcAlertsList />,
    members: <ArcAlertsMembers />,
    groups: <ArcAlertsGroups />,
    about: <ArcAlertsAbout />,
    settings: <ArcAlertsSettings />,
    preferences: <ArcAlertsPreferences />,
    'best-practices': <ArcAlertsBestPractices />,
  } satisfies Record<ArcAlertsView, ReactNode>;

  return (
    <AppLayout app={app} className="bg-[#f5f7fb] text-[#1b2a4a]">
      <main className="dashboard-content arc-workspace-shell">
        <ArcAlertsNav
          active={active}
          onChange={(view) => navigate(pathByView[view] ? `/${pathByView[view]}` : '/')}
        />
        <section className="arc-workspace-content" aria-live="polite">{content[active]}</section>
      </main>
    </AppLayout>
  );
}
