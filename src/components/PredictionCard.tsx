"use client";

import { ImageSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import type { PredictionDirection, ImageGenState } from "@/lib/types";

interface PredictionCardProps {
  direction: PredictionDirection;
  imageState: ImageGenState;
  onReselect: () => void;
  isReselecting: boolean;
}

export function PredictionCard({ direction, imageState, onReselect, isReselecting }: PredictionCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col transition-all duration-500 hover:border-purple-500/20">
      <div className="mb-3 space-y-1">
        <h4 className="text-white font-semibold text-sm line-clamp-1">{direction.direction}</h4>
        <p className="text-white/30 text-[11px] leading-relaxed line-clamp-2">{direction.rationale}</p>
      </div>

      <div className="flex-1 flex flex-col">
        {imageState.status === "loading" && <ImageSkeleton />}
        {imageState.status === "error" && (
          <div className="flex-1 rounded-xl border border-red-500/10 bg-red-500/[0.02] flex items-center justify-center p-4">
            <p className="text-red-300/50 text-xs text-center">{imageState.error || "坍缩失败"}</p>
          </div>
        )}
        {imageState.status === "success" && imageState.imageUrl && (
          <div className="relative group rounded-xl overflow-hidden portal-glow">
            <img src={imageState.imageUrl} alt={direction.direction}
              className="w-full aspect-square object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-3">
              <span className="text-white/60 text-[10px]">时间线投影</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={onReselect} disabled={isReselecting} loading={isReselecting} className="w-full text-[11px]">
          {isReselecting ? "坍缩中..." : "探索另一条时间线"}
        </Button>
      </div>
    </div>
  );
}
