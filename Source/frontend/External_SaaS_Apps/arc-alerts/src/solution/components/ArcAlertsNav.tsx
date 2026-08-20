import {
  BellIcon,
  FileTextIcon,
  HelpCircleIcon,
  MessageIcon,
  ShieldCheckIcon,
  StarIcon,
  UserIcon,
} from '@shared/app/components/UiIcons';

export type ArcAlertsView =
  | 'home'
  | 'new-alert'
  | 'alerts'
  | 'about'
  | 'settings'
  | 'preferences'
  | 'best-practices';

type NavItem = { id: ArcAlertsView; label: string; icon: typeof BellIcon };
type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: 'Communication',
    items: [
      { id: 'home', label: 'Home', icon: BellIcon },
      { id: 'about', label: 'About', icon: HelpCircleIcon },
      { id: 'new-alert', label: 'New Alert', icon: MessageIcon },
      { id: 'alerts', label: 'Alert List', icon: FileTextIcon },
    ],
  },
  {
    label: 'Directory',
    items: [
      { id: 'preferences', label: 'User Preferences', icon: UserIcon },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'settings', label: 'Settings', icon: ShieldCheckIcon },
      { id: 'best-practices', label: 'Best Practices', icon: StarIcon },
    ],
  },
];

interface ArcAlertsNavProps {
  active: ArcAlertsView;
  onChange: (view: ArcAlertsView) => void;
}

function NavButton({ item, active, onChange }: { item: NavItem; active: ArcAlertsView; onChange: (view: ArcAlertsView) => void }) {
  const Icon = item.icon;
  const selected = active === item.id;
  return (
    <button
      type="button"
      onClick={() => onChange(item.id)}
      aria-current={selected ? 'page' : undefined}
      className={`arc-module-nav__item ${selected ? 'arc-module-nav__item--active' : ''}`}
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </button>
  );
}

export function ArcAlertsNav({ active, onChange }: ArcAlertsNavProps) {
  const allItems = sections.flatMap((section) => section.items);
  return (
    <>
      <nav aria-label="ArcAlerts pages" className="arc-module-nav arc-module-nav--desktop">
        <div className="arc-module-nav__sections">
          {sections.map((section) => (
            <section key={section.label}>
              <p className="arc-module-nav__section-label">{section.label}</p>
              <div className="arc-module-nav__section-items">
                {section.items.map((item) => <NavButton key={item.id} item={item} active={active} onChange={onChange} />)}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <nav aria-label="ArcAlerts pages" className="arc-module-nav-mobile scrollbar-thin">
        <div className="arc-module-nav-mobile__track">
          {allItems.map((item) => <NavButton key={item.id} item={item} active={active} onChange={onChange} />)}
        </div>
      </nav>
    </>
  );
}
