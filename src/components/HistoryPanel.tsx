"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { HistoryItem } from "@/lib/types";

interface HistoryPanelProps {
  isOpen: boolean; onClose: () => void; items: HistoryItem[];
  onSelect: (item: HistoryItem) => void; onDelete: (id: string) => void;
}

export function HistoryPanel({ isOpen, onClose, items, onSelect, onDelete }: HistoryPanelProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <div className={cn(
        "fixed top-0 right-0 h-full z-50 bg-[#08081a]/95 backdrop-blur-xl border-l border-white/[0.04] w-80 sm:w-96",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
            <h2 className="text-white/80 font-semibold text-sm">时间线记录</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>关闭裂隙</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-3xl opacity-20">?</p>
                <p className="text-white/20 text-sm">还没有穿越记录</p>
                <p className="text-white/10 text-xs">去首页打开平行世界吧</p>
              </div>
            ) : (
              items.slice().reverse().map((item) => (
                <div key={item.id} onClick={() => onSelect(item)}
                  className="glass-card rounded-xl p-3 cursor-pointer transition-all duration-300 hover:border-purple-500/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-white/70 text-sm font-medium truncate">{item.showTitle}</h3>
                      <p className="text-white/25 text-[11px] mt-0.5">
                        {item.type === "ending" ? "替代结局" : "结局预测"}
                      </p>
                      <p className="text-white/15 text-[10px] mt-1">
                        {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0 text-red-400/40 hover:text-red-400"
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
                      ?
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
