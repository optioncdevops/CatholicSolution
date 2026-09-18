import { EyeIcon, EyeOffIcon, LockIcon } from '@shared/app/components/UiIcons';

interface ResetPasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}

export function ResetPasswordField({ id, label, value, onChange, visible, onToggle }: ResetPasswordFieldProps) {
  return (
    <div>
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap mt-2">
        <span className="auth-input-icon"><LockIcon size={17} /></span>
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} className="auth-input auth-input--with-action" autoComplete="new-password" required />
        <button type="button" className="auth-input-action" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}</button>
      </div>
    </div>
  );
}
