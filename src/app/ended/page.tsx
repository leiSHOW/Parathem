"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { useShow } from "@/context/ShowContext";
import { ShowDetail } from "@/components/ShowDetail";
import { EndingInput } from "@/components/EndingInput";
import { ImageDisplay } from "@/components/ImageDisplay";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useHistoryContext } from "@/context/HistoryContext";
import type { EndedHistoryItem } from "@/lib/types";

export default function EndedPage() {
  const { selectedShow } = useShow();
  const { showToast } = useToast();
  const router = useRouter();
  const { addItem } = useHistoryContext();

  const [userEnding, setUserEnding] = useState("");
  const [narrativeText, setNarrativeText] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [step, setStep] = useState<"input" | "generating_text" | "generating_image" | "result">("input");
  const [savedImages, setSavedImages] = useState<{ url: string; seed: number; imagePrompt: string }[]>([]);
  const imageGen = useImageGeneration();

  useEffect(() => {
    if (!selectedShow || selectedShow.status === "ongoing") {
      showToast("请先选择一部已完结的剧集", "warning");
      router.push("/");
      return;
    }
    // Force re-render when returning from history
    setSavedImages([]);
    setStep("input");
    setUserEnding("");
    setNarrativeText("");
    setImagePrompt("");
    imageGen.reset();
  }, [selectedShow, router, showToast]);

  const handleGenerate = useCallback(async () => {
    if (!userEnding.trim()) { showToast("请先输入你想要的结局", "warning"); return; }
    if (!selectedShow) return;

    setStep("generating_text");
    try {
      const res = await fetch("/api/generate-ending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showTitle: selectedShow.title,
          showSummary: selectedShow.summary,
          showGenres: selectedShow.genres,
          originalEnding: "",
          userEnding: userEnding.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) { showToast(data.error || "生成失败", "error"); setStep("input"); return; }

      setNarrativeText(data.data.narrativeText);
      setImagePrompt(data.data.imagePrompt);
      setStep("generating_image");

      const result = await imageGen.generate(data.data.imagePrompt);
      if (result) {
        const img = { url: result.imageUrl, seed: result.seed, imagePrompt: data.data.imagePrompt };
        setSavedImages([img]);
        setStep("result");

        addItem({
          id: uuid(), showTitle: selectedShow.title, showInfo: selectedShow,
          showStatus: "ended", createdAt: new Date().toISOString(), type: "ending",
          userEnding: userEnding.trim(), narrativeText: data.data.narrativeText,
          imagePrompt: data.data.imagePrompt, images: [img],
        } as EndedHistoryItem);
      } else { setStep("input"); }
    } catch { showToast("网络连接失败", "error"); setStep("input"); }
  }, [userEnding, selectedShow, imageGen, showToast, addItem]);

  const handleRegenerate = useCallback(async () => {
    if (!imagePrompt || !selectedShow) return;
    setStep("generating_image");
    try {
      const result = await imageGen.generate(imagePrompt, undefined);
      if (result) {
        const newImg = { url: result.imageUrl, seed: result.seed, imagePrompt };
        setSavedImages((prev) => [...prev, newImg]);
        setStep("result");
        addItem({
          id: uuid(), showTitle: selectedShow.title, showInfo: selectedShow,
          showStatus: "ended", createdAt: new Date().toISOString(), type: "ending",
          userEnding: userEnding.trim(), narrativeText, imagePrompt,
          images: [...savedImages, newImg],
        } as EndedHistoryItem);
      }
    } catch { showToast("重新生成失败", "error"); }
  }, [imagePrompt, selectedShow, imageGen, showToast, addItem, userEnding, narrativeText, savedImages]);

  if (!selectedShow) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)] px-4 py-8 sm:py-12">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <ShowDetail show={selectedShow} compact />

        {step === "input" && (
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h2 className="text-2xl font-bold shimmer-text">书写另一条时间线</h2>
              <p className="text-white/30 text-sm">在平行世界里，他们的故事由你来决定</p>
            </div>
            <EndingInput value={userEnding} onChange={setUserEnding} />
            <div className="flex justify-center">
              <Button variant="primary" size="lg" onClick={handleGenerate} disabled={!userEnding.trim()}>
                投射到平行世界
              </Button>
            </div>
          </div>
        )}

        {(step === "generating_text" || step === "generating_image") && (
          <div className="flex flex-col items-center gap-5 py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border border-purple-500/20 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-blue-500/20 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "12s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            </div>
            <p className="text-white/40 text-sm">
              {step === "generating_text" ? "正在编织平行结局的叙事..." : "正在从量子态中坍缩为画面..."}
            </p>
            <p className="text-white/15 text-xs">时间线坐标正在同步</p>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-10">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <p className="text-white/20 text-xs tracking-widest uppercase">平行世界投影</p>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed italic">
                &ldquo;{narrativeText}&rdquo;
              </p>
            </div>

            <div className="space-y-10">
              {savedImages.map((img, index) => (
                <div key={img.seed} className="space-y-5">
                  {index > 0 && (
                    <p className="text-center text-white/15 text-xs">
                      量子态坍缩变体 #{index + 1}
                    </p>
                  )}
                  <ImageDisplay
                    state={{ status: "success", imageUrl: img.url, seed: img.seed }}
                    onRegenerate={index === savedImages.length - 1 ? handleRegenerate : undefined}
                    regenerateLabel="坍缩为另一种画面"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="ghost" size="sm" onClick={() => {
                setStep("input"); setNarrativeText(""); setImagePrompt(""); setSavedImages([]); imageGen.reset();
              }}>
                重新书写结局
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
