import { createContext, useCallback, useContext, useMemo, type CSSProperties, type PropsWithChildren } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export type ToastVariant = 'success' | 'error' | 'info';

type ToastContextValue = { showToast: (message: string | string[], variant?: ToastVariant) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3800;

const VARIANT_TONE: Record<ToastVariant, { label: string; background: string }> = {
  success: { label: 'Success', background: '#16a34a' },
  error: { label: 'Error', background: 'var(--error, #dc2626)' },
  info: { label: 'Info', background: '#2563eb' },
};

const BANNER_STYLE: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  color: '#fff',
  borderRadius: '0.5rem',
  padding: '0.85rem 1rem 1rem',
  minWidth: '18rem',
  maxWidth: '24rem',
  fontFamily: 'var(--font-body, Inter, ui-sans-serif, system-ui, sans-serif)',
  boxShadow: '0 12px 32px -8px rgba(15,23,42,.28), 0 2px 6px rgba(15,23,42,.12)',
};

function ToastBanner({ variant, messages, duration, onDismiss }: { variant: ToastVariant; messages: string[]; duration: number; onDismiss: () => void }) {
  const tone = VARIANT_TONE[variant];
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} aria-live={variant === 'error' ? 'assertive' : 'polite'} style={{ ...BANNER_STYLE, background: tone.background }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{tone.label}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ background: 'transparent', border: 'none', color: '#fff', opacity: 0.85, cursor: 'pointer', lineHeight: 1, fontSize: '1rem', padding: 0 }}
        >
          ×
        </button>
      </div>
      <ul style={{ margin: '0.4rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {messages.map((message, index) => (
          <li key={index} style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.5 }}>{message}</li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="admin-toast-progress"
        style={{ position: 'absolute', left: 0, bottom: 0, height: '3px', background: 'rgba(255,255,255,.55)', animationDuration: `${duration}ms` }}
      />
    </div>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const showToast = useCallback((message: string | string[], variant: ToastVariant = 'success') => {
    const messages = (Array.isArray(message) ? message : [message]).filter(Boolean);
    const duration = variant === 'error' ? 4500 : DEFAULT_DURATION;
    toast.custom((t) => <ToastBanner variant={variant} messages={messages} duration={duration} onDismiss={() => toast.dismiss(t.id)} />, { duration });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="top-right" gutter={10} containerStyle={{ top: 16, right: 16, zIndex: 999999 }} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
