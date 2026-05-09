"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { ShowSearchResult } from "@/lib/types";

interface ShowSearchProps {
  onResults: (results: ShowSearchResult[]) => void;
  disabled?: boolean;
}

export function ShowSearch({ onResults, disabled }: ShowSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/search-show", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (!data.success) { showToast(data.error || "搜索失败", "error"); return; }

      const shows = data.data.shows as ShowSearchResult[];
      if (shows.length === 0) { showToast("未找到该剧集，请尝试其他关键词", "warning"); return; }
      onResults(shows);
    } catch { showToast("网络连接失败，请重试", "error"); }
    finally { setLoading(false); }
  }, [query, loading, onResults, showToast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSearch();
  }, [handleSearch, loading]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
      <Input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入剧集名称，打开平行世界..."
        className="flex-1 text-base sm:text-lg"
        disabled={loading || disabled}
      />
      <Button onClick={handleSearch} loading={loading} size="lg" disabled={disabled} className="sm:flex-shrink-0">
        {loading ? "穿越中..." : "穿越时间线"}
      </Button>
    </div>
  );
}
