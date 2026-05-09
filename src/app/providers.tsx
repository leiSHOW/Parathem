"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { ShowProvider } from "@/context/ShowContext";
import { HistoryProvider } from "@/context/HistoryContext";
import { AppShell } from "@/components/layout/AppShell";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ShowProvider>
        <HistoryProvider>
          <AppShell>{children}</AppShell>
        </HistoryProvider>
      </ShowProvider>
    </ToastProvider>
  );
}
