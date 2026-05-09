"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ToastType = "info" | "success" | "error" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

function getToastStyle(type: ToastType) {
  if (type === "info") {
    return {
      bg: "bg-white/10", border: "border-white/10", text: "text-white",
      icon: "i", iconBg: "bg-white/20", iconText: "text-white",
    };
  }
  if (type === "success") {
    return {
      bg: "bg-emerald-900/40", border: "border-emerald-500/30", text: "text-emerald-200",
      icon: "v", iconBg: "bg-emerald-500/30", iconText: "text-emerald-200",
    };
  }
  if (type === "error") {
    return {
      bg: "bg-red-900/40", border: "border-red-500/30", text: "text-red-200",
      icon: "x", iconBg: "bg-red-500/30", iconText: "text-red-200",
    };
  }
  // warning
  return {
    bg: "bg-amber-900/40", border: "border-amber-500/30", text: "text-amber-200",
    icon: "!", iconBg: "bg-amber-500/30", iconText: "text-amber-200",
  };
}

function SingleToast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const s = getToastStyle(toast.type);
  return (
    <div
      className={cn("pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-in", s.bg, s.border, s.text)}
      onClick={() => onDismiss(toast.id)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold", s.iconBg, s.iconText)}>
          {s.icon}
        </span>
        <p>{toast.message}</p>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => <SingleToast key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}
