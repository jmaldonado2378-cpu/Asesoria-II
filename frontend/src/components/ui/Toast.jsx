import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      if (next.length > 3) {
        return next.slice(next.length - 3); // keep only max 3
      }
      return next;
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message) => addToast(message, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="px-4 py-3 rounded-md shadow-lg flex items-center gap-3 text-sm font-medium animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto"
            style={{
              backgroundColor: toast.type === 'success' ? 'var(--accent-dim)' : 'rgba(239, 68, 68, 0.15)',
              color: 'var(--text-1)',
              borderLeft: `4px solid ${toast.type === 'success' ? 'var(--accent)' : '#ef4444'}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
