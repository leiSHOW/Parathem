"use client";

import type { ShowSearchResult } from "@/lib/types";

interface ShowCardProps { show: ShowSearchResult; onSelect: (show: ShowSearchResult) => void; }

export function ShowCard({ show, onSelect }: ShowCardProps) {
  const statusBadge = show.status === "ended"
    ? "bg-emerald-500/10 text-emerald-300/70 border-emerald-500/20"
    : "bg-blue-500/10 text-blue-300/70 border-blue-500/20";

  return (
    <button
      onClick={() => onSelect(show)}
      className="w-full glass-card rounded-2xl p-4 flex gap-4 items-center transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/20 text-left"
    >
      {show.posterUrl ? (
        <img src={show.posterUrl} alt={show.title}
          className="w-16 h-22 sm:w-20 sm:h-28 rounded-lg object-cover bg-white/5 flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center flex-shrink-0 border border-purple-500/10">
          <span className="text-purple-400/30 text-xl">?</span>
        </div>
      )}

      <div className="flex flex-col justify-center min-w-0 gap-0.5">
        <h3 className="text-white font-semibold text-sm sm:text-base truncate">{show.title}</h3>
        {show.year > 0 && <p className="text-white/30 text-xs">{show.year}</p>}
        <span className={`px-2 py-0.5 rounded-full text-[10px] border mt-1 w-fit ${statusBadge}`}>
          {show.status === "ended" ? "已完结" : "连载中"}
        </span>
      </div>
    </button>
  );
}
