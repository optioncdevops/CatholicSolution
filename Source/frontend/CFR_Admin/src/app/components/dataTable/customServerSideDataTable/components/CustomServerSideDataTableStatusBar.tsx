interface AggregateItem {
  id: string;
  header: string;
  value: number;
}

interface CustomServerSideDataTableStatusBarProps {
  aggregates: AggregateItem[];
}

export function CustomServerSideDataTableStatusBar({
  aggregates,
}: CustomServerSideDataTableStatusBarProps) {
  if (aggregates.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-t border-slate-200 bg-white text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      {aggregates.map((agg) => (
        <span key={agg.id}>
          {agg.header}: <strong>{agg.value}</strong>
        </span>
      ))}
    </div>
  );
}
