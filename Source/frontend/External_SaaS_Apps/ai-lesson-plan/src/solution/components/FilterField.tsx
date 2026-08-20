import type { ChangeEvent } from 'react';
type Props = { label: string; value: string; onChange: (value:string) => void; options: string[]; allLabel?: string };
export function FilterField({ label, value, onChange, options, allLabel }: Props) {
  return <label className="lesson-field"><span>{label}</span><select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}>{allLabel ? <option value="">{allLabel}</option> : null}{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}
