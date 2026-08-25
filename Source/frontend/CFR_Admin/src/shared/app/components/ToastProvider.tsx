import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import toast, { Toaster } from 'react-hot-toast';

type ToastContextValue = { showToast: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const showToast = useCallback((message: string) => {
    toast(message);
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
          icon: (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex', width: '1.35rem', height: '1.35rem', flexShrink: 0,
                borderRadius: '999px', background: 'var(--success-bg, #ecfdf5)', color: 'var(--success, #047857)',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800,
              }}
            >
              ✓
            </span>
          ),
          style: {
            background: 'var(--surface, #fff)',
            color: 'var(--text-primary, #12233f)',
            border: '1px solid var(--line, #e2e8f0)',
            borderLeft: '3px solid var(--success, #047857)',
            borderRadius: '0.7rem',
            padding: '0.65rem 0.9rem',
            fontSize: '0.8125rem',
            fontWeight: 650,
            fontFamily: 'var(--font-body, Inter, ui-sans-serif, system-ui, sans-serif)',
            boxShadow: '0 12px 32px -8px rgba(15,23,42,.18), 0 2px 6px rgba(15,23,42,.06)',
            maxWidth: '22rem',
          },
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
