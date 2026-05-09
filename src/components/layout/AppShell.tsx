"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useHistoryContext } from "@/context/HistoryContext";
import { useShow } from "@/context/ShowContext";
import type { HistoryItem } from "@/lib/types";

export function AppShell({ children }: { children: ReactNode }) {
  const { items, isOpen, togglePanel, closePanel, removeItem } = useHistoryContext();
  const { setSelectedShow } = useShow();
  const router = useRouter();

  const handleSelectHistory = (item: HistoryItem) => {
    setSelectedShow(item.showInfo);
    closePanel();
    router.push(item.type === "ending" ? "/ended" : "/ongoing");
  };

  return (
    <>
      <Header onToggleHistory={togglePanel} historyOpen={isOpen} />
      <HistoryPanel isOpen={isOpen} onClose={closePanel} items={items} onSelect={handleSelectHistory} onDelete={removeItem} />
      <main className="relative flex-1">{children}</main>
      <Footer />
    </>
  );
}
