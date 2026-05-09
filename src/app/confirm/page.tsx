"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShow } from "@/context/ShowContext";
import { ShowDetail } from "@/components/ShowDetail";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ConfirmPage() {
  const { selectedShow } = useShow();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!selectedShow) {
      showToast("请先搜索剧集", "warning");
      router.push("/");
    }
  }, [selectedShow, router, showToast]);

  if (!selectedShow) return null;

  const isEnded = selectedShow.status === "ended";

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-16">
      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold shimmer-text">确认时间线坐标</h1>
          <p className="text-white/30 text-sm">这是你要探索的平行宇宙吗？</p>
        </div>

        <ShowDetail show={selectedShow} />

        {/* Portal choice indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-center space-y-1">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isEnded ? "border-emerald-500/30 bg-emerald-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
              <span className="text-2xl sm:text-3xl">{isEnded ? "?" : "?"}</span>
            </div>
            <p className={`text-xs ${isEnded ? "text-emerald-300/60" : "text-blue-300/60"}`}>
              {isEnded ? "已完结时间线" : "进行中时间线"}
            </p>
          </div>

          <div className="h-px w-8 bg-gradient-to-r from-white/5 to-white/20" />
          <div className="text-white/10 text-2xl">?</div>
          <div className="h-px w-8 bg-gradient-to-l from-white/5 to-white/20" />

          <div className="text-center space-y-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-purple-500/30 bg-purple-500/5 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">?</span>
            </div>
            <p className="text-xs text-purple-300/60">平行时间线</p>
          </div>
        </div>

        {/* Description */}
        <div className={`rounded-2xl border p-5 text-center ${isEnded ? "border-emerald-500/15 bg-emerald-500/[0.02]" : "border-blue-500/15 bg-blue-500/[0.02]"}`}>
          <p className={`text-sm ${isEnded ? "text-emerald-200/60" : "text-blue-200/60"}`}>
            {isEnded
              ? "该剧集已经完结。你将在平行世界中为它书写一个全新的结局。"
              : "该剧集还在连载。AI 将穿越多元宇宙，为你投射 5 种可能的结局走向。"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" size="lg" onClick={() => router.push("/")}>
            返回主时间线
          </Button>
          <Button variant="primary" size="lg" onClick={() => router.push(isEnded ? "/ended" : "/ongoing")}>
            {isEnded ? "打开平行世界" : "探索宇宙分叉"}
          </Button>
        </div>
      </div>
    </div>
  );
}
