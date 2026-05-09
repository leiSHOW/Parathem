"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface HeaderProps { onToggleHistory: () => void; historyOpen: boolean; }

export function Header({ onToggleHistory, historyOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.03] bg-[#06060f]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold shimmer-text group-hover:opacity-80 transition-opacity">Parathem</span>
          <span className="text-white/10 text-xs hidden sm:inline">平行世界的他们</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={onToggleHistory}>
          ? {historyOpen ? "关闭裂隙" : "时间线记录"}
        </Button>
      </div>
    </header>
  );
}
