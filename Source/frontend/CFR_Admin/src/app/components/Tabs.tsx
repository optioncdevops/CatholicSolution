import type { ReactNode } from 'react';

interface Tab { id: string; label: string; count?: number; }

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div role="tablist" aria-label="Sections" className="flex items-center gap-1 border-b border-[var(--line)] overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              const index = tabs.findIndex((item) => item.id === tab.id);
              if (event.key === 'ArrowRight') onChange(tabs[(index + 1) % tabs.length].id);
              if (event.key === 'ArrowLeft') onChange(tabs[(index - 1 + tabs.length) % tabs.length].id);
            }}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[0.8125rem] font-bold transition-colors ${
              active
                ? 'border-[var(--secondary)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span
                className={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.6875rem] font-extrabold leading-none ${
                  active ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--surface-muted)] text-[var(--text-faint)]'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, activeId, children }: { id: string; activeId: string; children: ReactNode }) {
  if (id !== activeId) return null;
  return <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>{children}</div>;
}
