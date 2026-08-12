import { SearchIcon } from '@shared/app/components/UiIcons';
import { categories, months } from './contentData';

const legacyResourceTypes = ['All', 'Coloring Page', 'Word Search'] as const;

type ContentFiltersProps = {
  query: string;
  month: string;
  category: string;
  type: string;
  onQuery: (value: string) => void;
  onMonth: (value: string) => void;
  onCategory: (value: string) => void;
  onType: (value: string) => void;
  onClear: () => void;
};

export function ContentFilters({
  query,
  month,
  category,
  type,
  onQuery,
  onMonth,
  onCategory,
  onType,
  onClear,
}: ContentFiltersProps) {
  const filtered = month !== 'All' || category !== 'All' || type !== 'All' || Boolean(query);

  return (
    <aside className="content-filters">
      <div className="content-filters__heading">
        <div>
          <span className="metric-label text-violet-700">Browse library</span>
          <h2>Find resources</h2>
        </div>
        {filtered ? <button type="button" onClick={onClear}>Clear</button> : null}
      </div>
      <label className="content-filter-search">
        <SearchIcon size={16}/>
        <input
          value={query}
          onChange={(event: { target: { value: string } }) => onQuery(event.target.value)}
          placeholder="Saint, topic, grade…"
          aria-label="Search Catholic Content"
        />
      </label>
      <FilterSelect label="Month" value={month} options={months} onChange={onMonth}/>
      <FilterSelect label="Category" value={category} options={categories} onChange={onCategory}/>
      <FilterSelect label="Resource type" value={type} options={legacyResourceTypes} onChange={onType}/>
      <div className="content-filters__note">
        <strong>1,200+ faith resources</strong>
        <span>New resources are added regularly for Church events, feast days, and classroom use.</span>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="content-filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event: { target: { value: string } }) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
