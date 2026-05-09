"use client";

import { ImageSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import type { ImageGenState } from "@/lib/types";

interface ImageDisplayProps {
  state: ImageGenState;
  onRegenerate?: () => void;
  regenerateLabel?: string;
  narrativeText?: string;
}

export function ImageDisplay({ state, onRegenerate, regenerateLabel = "重新生成", narrativeText }: ImageDisplayProps) {
  if (state.status === "idle") return null;

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {state.status === "loading" && <ImageSkeleton />}

      {state.status === "error" && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-6 text-center space-y-3">
          <p className="text-red-300/70 text-sm">{state.error}</p>
          {onRegenerate && <Button variant="secondary" size="sm" onClick={onRegenerate}>重试</Button>}
        </div>
      )}

      {state.status === "success" && state.imageUrl && (
        <>
          <div className="relative group rounded-xl overflow-hidden portal-glow">
            <img src={state.imageUrl} alt="Generated" className="w-full aspect-square object-cover" loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<div class="aspect-square flex items-center justify-center text-white/20 text-sm">量子态坍缩失败</div>';
              }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4">
              <span className="text-white/70 text-xs">平行世界投影</span>
            </div>
          </div>

          {narrativeText && (
            <p className="text-white/40 text-sm leading-relaxed text-center italic px-2">
              &ldquo;{narrativeText}&rdquo;
            </p>
          )}

          {onRegenerate && (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" onClick={onRegenerate}>{regenerateLabel}</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
