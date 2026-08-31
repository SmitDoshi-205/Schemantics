import { useCallback, useState } from 'react';
import { ToastContext } from './context';

const STYLES = {
  success: { border: 'border-secondary', icon: 'check_circle', iconColor: 'text-secondary' },
  error: { border: 'border-error', icon: 'error', iconColor: 'text-error' },
  info: { border: 'border-tertiary-container', icon: 'info', iconColor: 'text-tertiary-container' },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const toast = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-110 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              className={`glass-panel-sm pointer-events-auto flex items-start gap-3 border-l-4 px-4 py-3 ${s.border}`}
              style={{ animation: 'toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`}>{s.icon}</span>
              <p className="font-body text-sm text-on-surface">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="material-symbols-outlined ml-auto text-[16px] text-on-surface-variant hover:text-on-surface"
              >
                close
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}