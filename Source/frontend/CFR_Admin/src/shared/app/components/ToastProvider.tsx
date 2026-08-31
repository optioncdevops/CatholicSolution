import { createContext, useCallback, useContext, useMemo, type CSSProperties, type PropsWithChildren, type ReactElement } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export type ToastVariant = 'success' | 'error';

type ToastContextValue = { showToast: (message: string, variant?: ToastVariant) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_TONE: Record<ToastVariant, { icon: string; color: string; background: string }> = {
  success: { icon: '✓', color: 'var(--success, #047857)', background: 'var(--success-bg, #ecfdf5)' },
  error: { icon: '!', color: 'var(--danger, #b91c1c)', background: 'var(--danger-bg, #fef2f2)' },
};

const BASE_TOAST_STYLE: CSSProperties = {
  background: 'var(--surface, #fff)',
  color: 'var(--text-primary, #12233f)',
  border: '1px solid var(--line, #e2e8f0)',
  borderRadius: '0.7rem',
  padding: '0.65rem 0.9rem',
  fontSize: '0.8125rem',
  fontWeight: 650,
  fontFamily: 'var(--font-body, Inter, ui-sans-serif, system-ui, sans-serif)',
  boxShadow: '0 12px 32px -8px rgba(15,23,42,.18), 0 2px 6px rgba(15,23,42,.06)',
  maxWidth: '22rem',
};

function toastIcon(variant: ToastVariant): ReactElement {
  const tone = VARIANT_TONE[variant];
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex', width: '1.35rem', height: '1.35rem', flexShrink: 0,
        borderRadius: '999px', background: tone.background, color: tone.color,
        alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800,
      }}
    >
      {tone.icon}
    </span>
  );
}

function toastStyle(variant: ToastVariant): CSSProperties {
  return { ...BASE_TOAST_STYLE, borderLeft: `3px solid ${VARIANT_TONE[variant].color}` };
}

export function ToastProvider({ children }: PropsWithChildren) {
  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    toast(message, { icon: toastIcon(variant), style: toastStyle(variant) });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 3200,
          icon: toastIcon('success'),
          style: toastStyle('success'),
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
