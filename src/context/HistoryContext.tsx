"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { HistoryItem } from "@/lib/types";
import { loadHistory, addHistoryItem, deleteHistoryItem } from "@/lib/utils/storage";

interface HistoryContextValue {
  items: HistoryItem[];
  isOpen: boolean;
  togglePanel: () => void;
  closePanel: () => void;
  addItem: (item: HistoryItem) => void;
  removeItem: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function useHistoryContext() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistoryContext must be used within HistoryProvider");
  return ctx;
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const refresh = useCallback(() => {
    setItems(loadHistory());
  }, []);

  const addItem = useCallback((item: HistoryItem) => {
    addHistoryItem(item);
    setItems(loadHistory());
  }, []);

  const removeItem = useCallback((id: string) => {
    deleteHistoryItem(id);
    setItems(loadHistory());
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setItems(loadHistory());
      return !prev;
    });
  }, []);

  const closePanel = useCallback(() => setIsOpen(false), []);

  return (
    <HistoryContext.Provider value={{ items, isOpen, togglePanel, closePanel, addItem, removeItem }}>
      {children}
    </HistoryContext.Provider>
  );
}
