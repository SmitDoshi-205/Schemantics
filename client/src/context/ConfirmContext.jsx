import { useCallback, useState } from 'react';
import { ConfirmContext } from './context';

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, { danger = true } = {}) => {
    return new Promise((resolve) => {
      setState({ message, danger, resolve });
    });
  }, []);

  function handle(result) {
    state?.resolve(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-surface-base/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm p-6" style={{ animation: 'toast-in 0.2s ease forwards' }}>
            <p className="mb-6 font-body text-sm leading-relaxed text-on-surface">{state.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => handle(false)} className="neo-button-secondary px-4 py-2 font-display text-xs uppercase tracking-wide">
                Cancel
              </button>
              <button
                onClick={() => handle(true)}
                className={`neo-button px-4 py-2 font-display text-xs font-bold uppercase tracking-wide ${state.danger ? 'bg-error text-on-error' : ''}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}