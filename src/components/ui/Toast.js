"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

// Single-slot toast: a new message replaces the old one. Optional action (e.g. Undo).
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((message, action) => {
    clearTimeout(timer.current);
    setToast({ message, action, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), action ? 5000 : 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-6"
      >
        {toast && (
          <div
            key={toast.key}
            className="pointer-events-auto flex animate-rise items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-sm text-bg shadow-float"
          >
            <span className="py-1">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  setToast(null);
                }}
                className="rounded-full px-3 py-1 font-semibold text-accent transition-colors hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
