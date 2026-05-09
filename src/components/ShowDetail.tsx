import type { ShowInfo } from "@/lib/types";

interface ShowDetailProps { show: ShowInfo; compact?: boolean; }

export function ShowDetail({ show, compact = false }: ShowDetailProps) {
  const statusBadge = {
    ended: "bg-emerald-500/10 text-emerald-300/70 border-emerald-500/20",
    ongoing: "bg-blue-500/10 text-blue-300/70 border-blue-500/20",
    unknown: "bg-white/5 text-white/30 border-white/10",
  }[show.status];

  const statusLabel = { ended: "已完结", ongoing: "连载中", unknown: "未知" }[show.status];

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm text-white/40 flex-wrap">
        <span className="text-white font-medium text-base">{show.title}</span>
        {show.year > 0 && <span>{show.year}</span>}
        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusBadge}`}>{statusLabel}</span>
        {show.statusDetail && <span className="text-white/20 text-xs">{show.statusDetail}</span>}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
      {show.posterUrl && (
        <img src={show.posterUrl} alt={show.title}
          className="w-28 h-40 sm:w-32 sm:h-44 rounded-xl object-cover bg-white/5 flex-shrink-0 mx-auto sm:mx-0 border border-white/5"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      )}
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{show.title}</h2>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge}`}>{statusLabel}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/40">
          {show.year > 0 && <span>开播: {show.year}</span>}
          {show.rating > 0 && <span className="text-amber-400/70">豆瓣 {show.rating.toFixed(1)}</span>}
        </div>

        {show.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {show.genres.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-purple-500/5 border border-purple-500/10 text-[11px] text-purple-200/50">{g}</span>
            ))}
          </div>
        )}

        {show.actors.length > 0 && (
          <p className="text-white/40 text-sm">主演: {show.actors.join(" / ")}</p>
        )}

        {show.summary && (
          <p className="text-white/30 text-sm leading-relaxed line-clamp-3">{show.summary}</p>
        )}

        <p className="text-white/25 text-sm">{show.statusDetail}</p>
      </div>
    </div>
  );
}
