"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

// Single-slot toast: a new message replaces the old one. Optional action (e.g. Undo).
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const region = useRef(null);

  // Modal <dialog>s live in the browser's top layer, above any z-index. The toast is a popover so it can
  // join that layer too; re-showing it on every toast puts it above whatever dialog opened last.
  useEffect(() => {
    const el = region.current;
    if (!el?.showPopover) return;
    if (el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
  }, [toast]);

  const show = useCallback((message, action) => {
    clearTimeout(timer.current);
    setToast({ message, action, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), action ? 5000 : 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        ref={region}
        popover="manual"
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-auto bottom-24 z-[60] m-0 flex h-auto w-full justify-center overflow-visible border-0 bg-transparent p-0 px-4 lg:bottom-6"
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
