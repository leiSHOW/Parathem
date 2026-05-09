"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShowSearch } from "@/components/ShowSearch";
import { ShowCard } from "@/components/ShowCard";
import { Spinner } from "@/components/ui/Spinner";
import { useShow } from "@/context/ShowContext";
import type { ShowSearchResult, ShowInfo } from "@/lib/types";

export default function HomePage() {
  const [results, setResults] = useState<ShowSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedShow } = useShow();
  const router = useRouter();

  const handleResults = useCallback(
    (shows: ShowSearchResult[]) => {
      if (shows.length === 0) return;
      if (shows.length === 1) {
        handleSelectShow(shows[0]);
        return;
      }
      setResults(shows);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSelectShow = useCallback(
    async (show: ShowSearchResult) => {
      setLoading(true);
      try {
        const res = await fetch("/api/search-show", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: show.title }),
        });
        const data = await res.json();

        if (data.success && data.data.exactMatch) {
          setSelectedShow(data.data.exactMatch as ShowInfo);
        } else {
          setSelectedShow({
            ...show, originalTitle: undefined, directors: [], actors: [],
            summary: "", genres: [], episodeCount: undefined,
            statusDetail: show.status === "ended" ? "已完结" : "连载中",
          });
        }
        router.push("/confirm");
      } catch {
        router.push("/confirm");
      } finally {
        setLoading(false);
      }
    },
    [setSelectedShow, router]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        {/* Animated dimensional rings */}
        <div className="mb-10 relative inline-flex items-center justify-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-purple-500/10 animate-spin-slow absolute" />
          <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-blue-500/8 animate-spin-slow absolute" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
          <div className="w-52 h-52 sm:w-72 sm:h-72 rounded-full border border-purple-500/5 animate-spin-slow absolute" style={{ animationDuration: "30s" }} />

          {/* Portal center */}
          <div className="relative z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl rounded-full animate-pulse-glow-purple" />
            <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight shimmer-text">
              Parathem
            </h1>
          </div>
        </div>

        {/* Mirror reflection effect */}
        <div className="relative mb-3">
          <p className="text-lg sm:text-xl text-purple-200/40 font-medium animate-float-dimension">
            平行世界的他们
          </p>
          <p className="absolute top-full left-1/2 -translate-x-1/2 text-sm text-purple-200/10 mt-0.5 scale-y-[-1] select-none">
            平行世界的他们
          </p>
        </div>
        <p className="text-sm text-white/15">The Parallel Them</p>

        {/* Rift divider */}
        <div className="flex items-center gap-3 my-10">
          <hr className="portal-divider flex-1" />
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-purple-400/30 flex-shrink-0">
            <circle cx="16" cy="8" r="2.5" fill="currentColor" />
            <path d="M16 10.5 L16 22" stroke="currentColor" strokeWidth="0.8" className="animate-timeline-split" />
            <path d="M16 18 L10 26" stroke="currentColor" strokeWidth="0.8" className="animate-timeline-split" />
            <path d="M16 18 L22 26" stroke="currentColor" strokeWidth="0.8" className="animate-timeline-split" />
            <circle cx="10" cy="26" r="1.2" fill="currentColor" opacity="0.5" />
            <circle cx="22" cy="26" r="1.2" fill="currentColor" opacity="0.5" />
          </svg>
          <hr className="portal-divider flex-1" />
        </div>

        <p className="text-white/30 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          输入一部剧，穿越时间线，在平行宇宙中寻找另一种可能
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-2xl mx-auto">
        <ShowSearch onResults={handleResults} disabled={loading} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-12">
          <Spinner size="lg" label="正在穿越时间线..." />
        </div>
      )}

      {/* Multiple results */}
      {!loading && results.length > 1 && (
        <div className="w-full max-w-2xl mx-auto mt-10 space-y-4">
          <p className="text-white/30 text-sm text-center">
            在 {results.length} 条时间线中发现了匹配...
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((show) => (
              <ShowCard key={show.doubanId || show.title} show={show} onSelect={handleSelectShow} />
            ))}
          </div>
        </div>
      )}

      {/* Empty hint */}
      {!loading && results.length === 0 && (
        <p className="mt-10 text-white/10 text-xs text-center max-w-xs">
          搜索任意电视剧或网络剧集，打开平行世界的大门
        </p>
      )}
    </div>
  );
}
