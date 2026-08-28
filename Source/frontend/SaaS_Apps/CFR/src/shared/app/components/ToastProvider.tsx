import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type ToastContextValue = { showToast: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
    setVisible(true);
    window.setTimeout(() => setVisible(false), 2600);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-xl border-b-4 border-brand-gold bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-2xl transition-all ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-16 opacity-0'}`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
