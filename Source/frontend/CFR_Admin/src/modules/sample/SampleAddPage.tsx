/**
 * DEV-ONLY COMPONENT LIBRARY — "Add" reference page.
 *
 * Shows every shared form-input component this app has, with its main option variants,
 * side by side — a living reference for building new forms without re-reading every
 * component's source file. Purely local state, zero dependency on AdminDataContext or any
 * real entity type.
 *
 * Already scoped to development builds only (App.tsx registers these routes and the
 * `import.meta.env.DEV`-gated ungated-route exception in menuHelpers.ts only when
 * `import.meta.env.DEV` is true) — a hosted build (pilot/staging/live) never bundles or exposes
 * this page. Nav no longer has a static `ADMINISTRATION_ITEMS` list to worry about; the admin nav
 * is entirely backend-menu-driven now, so there is nothing there referencing this page either.
 *
 * TO REMOVE THIS ENTIRELY:
 *   1. Delete this file, `SampleViewPage.tsx`, and `sampleData.ts` (the whole `sample/` folder).
 *   2. Remove the two `/admin/administration/component-library/*` routes (and their DEV-gated
 *      lazy imports) from `App.tsx`.
 *   3. Remove `/admin/administration/component-library` from the DEV-only branch of
 *      `UNGATED_ROUTE_PREFIXES` in `menuHelpers.ts`.
 * Nothing outside this folder imports from it, so those three edits are the whole removal.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Check, Lock, Mail, Palette, Plus, Save, Search, Trash2, X,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import type { ButtonSize, ButtonTone, ButtonVariant, IconButtonSize, IconButtonVariant } from '@app/components/buttons';
import {
  InputField, TextareaField, InputWithSuffixField, OtpInputField, VehicleNumberInput, CharacterLimitEditor,
  Dropdown, MultiSelect, RadioGroup, CheckboxGroup, CommonCheckbox, CommonRadio, CommonSwitch,
  DatePicker, TimePicker, DateTimePicker, MonthPicker, DateRangePicker, YearRangePicker,
  ColorPicker, RichTextEditor, FileUpload, MultiFileUpload, ProfileImageUpload,
} from '@app/components/formControls';
import {
  SAMPLE_SINGLE_OPTIONS, SAMPLE_GROUPED_OPTIONS, SAMPLE_MULTI_OPTIONS, SAMPLE_RADIO_OPTIONS, SAMPLE_CHECKBOX_OPTIONS,
} from './sampleData';

const BUTTON_VARIANTS: ButtonVariant[] = [
  'primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'info', 'headerSecondary', 'clearFilter',
];
const BUTTON_TONES: ButtonTone[] = ['solid', 'soft'];
const BUTTON_SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg'];
const ICON_BUTTON_VARIANTS: IconButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'info'];
const ICON_BUTTON_SIZES: IconButtonSize[] = ['xs', 'sm', 'md', 'lg'];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="admin-panel-card">
      <div className="admin-panel-card__header">
        <div>
          <h2 className="panel-title">{title}</h2>
          {description ? <p className="panel-subtitle">{description}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-3.5 p-4">{children}</div>
    </section>
  );
}

export function SampleAddPage() {
  const [text, setText] = useState('');
  const [textarea, setTextarea] = useState('');
  const [dropdownValue, setDropdownValue] = useState<string | null>('active');
  const [groupedValue, setGroupedValue] = useState<string | null>('jordan');
  const [multiValue, setMultiValue] = useState<string[]>(['billing']);
  const [radioValue, setRadioValue] = useState('email');
  const [checkboxValues, setCheckboxValues] = useState<string[]>(['invoices']);
  const [switchOn, setSwitchOn] = useState(true);
  const [checkboxOn, setCheckboxOn] = useState(false);
  const [radioA, setRadioA] = useState('one');
  const [date, setDate] = useState('2026-08-22');
  const [time, setTime] = useState('09:30');
  const [dateTime, setDateTime] = useState<string | null>('2026-08-22 09:30');
  const [month, setMonth] = useState('2026-08');
  const [dateRangeFrom, setDateRangeFrom] = useState('2026-08-01');
  const [dateRangeTo, setDateRangeTo] = useState('2026-08-31');
  const [yearFrom, setYearFrom] = useState('2024');
  const [yearTo, setYearTo] = useState('2026');
  const [color, setColor] = useState<string | null>('#12264c');
  const [richText, setRichText] = useState('<p>Sample <strong>rich text</strong> content.</p>');
  const [loadingDemo, setLoadingDemo] = useState(false);
  const { control: otpControl } = useForm<{ otp: string }>();

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Component Library — Add"
        action={<Link to="/admin/administration/component-library/view" className="text-xs font-bold text-white hover:underline">View Page Reference →</Link>}
      />

      <SectionCard title="Buttons" description="CommonButton — every variant × tone, plus size scale, icons, loading and tooltip.">
        <div className="flex flex-col gap-2">
          {BUTTON_TONES.map((tone) => (
            <div key={tone} className="flex flex-wrap items-center gap-2">
              <span className="w-14 shrink-0 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{tone}</span>
              {BUTTON_VARIANTS.map((variant) => (
                <CommonButton key={variant} variant={variant} tone={tone} size="sm">{variant}</CommonButton>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 shrink-0 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Sizes</span>
          {BUTTON_SIZES.map((size) => <CommonButton key={size} variant="primary" size={size}>{size}</CommonButton>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 shrink-0 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Extras</span>
          <CommonButton variant="primary" iconLeft={<Plus size={14} />}>Icon Left</CommonButton>
          <CommonButton variant="outline" iconRight={<Check size={14} />}>Icon Right</CommonButton>
          <CommonButton variant="danger" iconLeft={<Trash2 size={14} />}>Danger</CommonButton>
          <CommonButton variant="primary" loading={loadingDemo} onClick={() => { setLoadingDemo(true); setTimeout(() => setLoadingDemo(false), 1200); }}>
            {loadingDemo ? 'Loading…' : 'Click to Load'}
          </CommonButton>
          <CommonButton variant="outline" disabled>Disabled</CommonButton>
          <CommonButton variant="outline" tooltip="Tooltip content on hover">Hover Me</CommonButton>
        </div>

        <div className="admin-product-card__divider" />

        <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">CommonIconButton — variant × size</p>
        <div className="flex flex-col gap-2">
          {ICON_BUTTON_SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-2">
              <span className="w-14 shrink-0 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{size}</span>
              {ICON_BUTTON_VARIANTS.map((variant) => (
                <CommonIconButton key={variant} variant={variant} size={size} aria-label={`${variant} ${size}`} icon={<Search size={12} />} />
              ))}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Text Inputs" description="InputField in its common states, plus the specialized single-line variants.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InputField label="Basic" value={text} onChange={(event) => setText(event.target.value)} placeholder="Type something" />
          <InputField label="Required" required value="" onChange={() => {}} />
          <InputField label="Optional" optional value="" onChange={() => {}} />
          <InputField label="With error" value="bad-value" onChange={() => {}} error="This value is invalid." />
          <InputField label="Disabled" value="Can't edit this" onChange={() => {}} disabled />
          <InputField label="With start icon" value="" onChange={() => {}} startIcon={<Mail size={13} />} placeholder="you@example.com" />
          <InputField label="Password" type="password" value="hunter2" onChange={() => {}} startIcon={<Lock size={13} />} />
          <InputField label="Number" type="number" value={4} onChange={() => {}} />
          <InputWithSuffixField label="Amount" suffixLabel="USD" value="249" onValueChange={() => {}} />
          <OtpInputField label="One-time code" control={otpControl} name="otp" length={6} />
          <VehicleNumberInput label="Vehicle number" value="" onChange={() => {}} />
          <CharacterLimitEditor label="Short note" value="" onChange={() => {}} maxLength={80} />
        </div>
        <TextareaField label="Textarea" value={textarea} onChange={(event) => setTextarea(event.target.value)} rows={3} placeholder="Multi-line text" />
      </SectionCard>

      <SectionCard title="Selection Controls" description="Dropdown (single + grouped), MultiSelect, RadioGroup, CheckboxGroup, switches and standalone checkbox/radio.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Dropdown label="Single select" value={dropdownValue ?? undefined} onValueChange={(value) => setDropdownValue(value ?? null)} options={SAMPLE_SINGLE_OPTIONS} />
          <Dropdown label="Grouped options" value={groupedValue ?? undefined} onValueChange={(value) => setGroupedValue(value ?? null)} options={SAMPLE_GROUPED_OPTIONS} />
          <MultiSelect label="Multi-select" value={multiValue} onValueChange={setMultiValue} options={SAMPLE_MULTI_OPTIONS} />
          <Dropdown label="Clearable off" value="active" onValueChange={() => {}} options={SAMPLE_SINGLE_OPTIONS} clearable={false} searchable={false} />
        </div>
        <RadioGroup label="Notification channel" options={SAMPLE_RADIO_OPTIONS} value={radioValue} onValueChange={setRadioValue} direction="horizontal" />
        <CheckboxGroup label="Email me about" options={SAMPLE_CHECKBOX_OPTIONS} value={checkboxValues} onValueChange={setCheckboxValues} />
        <div className="flex flex-wrap items-center gap-6">
          <CommonSwitch label="Enabled" checked={switchOn} onCheckedChange={setSwitchOn} />
          <CommonCheckbox label="Standalone checkbox" checked={checkboxOn} onCheckedChange={setCheckboxOn} />
          <CommonRadio label="Option one" name="sample-standalone-radio" radioValue="one" value={radioA} onValueChange={setRadioA} />
          <CommonRadio label="Option two" name="sample-standalone-radio" radioValue="two" value={radioA} onValueChange={setRadioA} />
        </div>
      </SectionCard>

      <SectionCard title="Date & Time Pickers" description="Every picker variant in the ported library.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DatePicker label="Date" value={date} onChange={setDate} />
          <TimePicker label="Time" value={time} onChange={setTime} />
          <DateTimePicker label="Date & time" value={dateTime} onChange={setDateTime} />
          <MonthPicker label="Month" value={month} onChange={setMonth} />
          <YearRangePicker
            fromLabel="From year" toLabel="To year"
            fromProps={{ value: yearFrom, onChange: setYearFrom }}
            toProps={{ value: yearTo, onChange: setYearTo }}
          />
        </div>
        <DateRangePicker
          fromLabel="From date" toLabel="To date"
          fromProps={{ value: dateRangeFrom, onChange: setDateRangeFrom }}
          toProps={{ value: dateRangeTo, onChange: setDateRangeTo }}
        />
      </SectionCard>

      <SectionCard title="Color & Rich Text">
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorPicker label="Accent color" value={color} onChange={setColor} />
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Palette size={13} /> Selected: {color ?? 'none'}</div>
        </div>
        <RichTextEditor label="Description" value={richText} onChange={setRichText} />
      </SectionCard>

      <SectionCard title="File Uploads" description="Every upload variant — single file, image/profile, and multi-file.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FileUpload label="Document" variant="file" onFileChange={() => {}} helperText="PDF, DOCX up to 10MB" />
          <FileUpload label="Image" variant="image" onFileChange={() => {}} />
          <ProfileImageUpload label="Profile photo" onFileChange={() => {}} />
        </div>
        <MultiFileUpload label="Attachments" onFilesChange={() => {}} />
      </SectionCard>

      <div className="admin-sticky-footer">
        <CommonButton variant="outline" iconLeft={<X size={14} />}>Cancel</CommonButton>
        <CommonButton variant="primary" iconLeft={<Save size={14} />}>Save</CommonButton>
      </div>
    </div>
  );
}
