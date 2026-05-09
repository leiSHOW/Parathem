"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ShowInfo } from "@/lib/types";

interface ShowContextValue {
  selectedShow: ShowInfo | null;
  setSelectedShow: (show: ShowInfo | null) => void;
  clearShow: () => void;
}

const ShowContext = createContext<ShowContextValue>({
  selectedShow: null,
  setSelectedShow: () => {},
  clearShow: () => {},
});

export function useShow() {
  return useContext(ShowContext);
}

export function ShowProvider({ children }: { children: ReactNode }) {
  const [selectedShow, setSelectedShow] = useState<ShowInfo | null>(null);

  const clearShow = useCallback(() => {
    setSelectedShow(null);
  }, []);

  return (
    <ShowContext.Provider value={{ selectedShow, setSelectedShow, clearShow }}>
      {children}
    </ShowContext.Provider>
  );
}
