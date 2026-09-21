import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

type ToastContextValue = { showToast: (message: string | string[], variant?: ToastVariant) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_TONE: Record<ToastVariant, { label: string; className: string }> = {
  info: { label: '', className: 'border-brand-gold bg-brand-navy' },
  success: { label: 'Success', className: 'border-emerald-400 bg-emerald-600' },
  error: { label: 'Error', className: 'border-red-400 bg-red-600' },
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<string[]>([]);
  const [variant, setVariant] = useState<ToastVariant>('info');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((next: string | string[], nextVariant: ToastVariant = 'info') => {
    const list = (Array.isArray(next) ? next : [next]).filter(Boolean);
    if (!list.length) return;
    setMessages(list);
    setVariant(nextVariant);
    setVisible(true);
    window.setTimeout(() => setVisible(false), list.length > 1 ? 5000 : 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);
  const tone = VARIANT_TONE[variant];

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        className={`fixed top-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-xl border-t-4 px-4 py-3 text-left text-white shadow-2xl transition-all ${tone.className} ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'}`}
      >
        <div className="flex items-start justify-between gap-3">
          {tone.label ? <span className="text-[0.6875rem] font-extrabold uppercase tracking-wide">{tone.label}</span> : <span />}
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 leading-none text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="mt-1 flex flex-col gap-0.5 text-[0.8125rem] font-semibold leading-snug">
          {messages.map((item, index) => <span key={index}>{item}</span>)}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
