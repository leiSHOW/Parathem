"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { useShow } from "@/context/ShowContext";
import { ShowDetail } from "@/components/ShowDetail";
import { PredictionGrid } from "@/components/PredictionGrid";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useHistoryContext } from "@/context/HistoryContext";
import type {
  PredictionDirection,
  PredictionSet,
  ImageGenState,
  OngoingHistoryItem,
  PredictionRecord,
} from "@/lib/types";

export default function OngoingPage() {
  const { selectedShow } = useShow();
  const { showToast } = useToast();
  const router = useRouter();
  const { addItem } = useHistoryContext();
  const hasStarted = useRef(false);

  const [predictions, setPredictions] = useState<PredictionDirection[]>([]);
  const [imageStates, setImageStates] = useState<ImageGenState[]>([]);
  const [recordedImages, setRecordedImages] = useState<PredictionRecord[]>([]);
  const [step, setStep] = useState<"loading_predictions" | "generating_images" | "result">(
    "loading_predictions"
  );
  const [reselectedIndex, setReselectedIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!selectedShow || selectedShow.status === "ended") {
      showToast("请先选择一部连载中的剧集", "warning");
      router.push("/");
      return;
    }

    // Prevent StrictMode double-fire
    if (hasStarted.current) return;
    hasStarted.current = true;

    generatePredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShow]);

  const generatePredictions = useCallback(async () => {
    if (!selectedShow) return;
    setStep("loading_predictions");

    try {
      // Step 1: Get predictions from DeepSeek
      const res = await fetch("/api/generate-predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showTitle: selectedShow.title,
          showSummary: selectedShow.summary,
          showGenres: selectedShow.genres,
          currentStatus: selectedShow.statusDetail,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        showToast(data.error || "预测生成失败", "error");
        return;
      }

      const result = data.data as PredictionSet;
      setPredictions(result.predictions);

      const initialStates: ImageGenState[] = result.predictions.map(() => ({ status: "loading" }));
      setImageStates(initialStates);
      setStep("generating_images");

      // Step 2: Generate ALL images IN PARALLEL
      setProgress({ done: 0, total: result.predictions.length });

      const promises = result.predictions.map((pred, i) =>
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: pred.imagePrompt }),
        })
          .then((r) => r.json())
          .then((imgData) => {
            setProgress((p) => ({ ...p, done: p.done + 1 }));

            if (imgData.success) {
              setImageStates((prev) => {
                const next = [...prev];
                next[i] = { status: "success", imageUrl: imgData.data.imageUrl, seed: imgData.data.seed };
                return next;
              });
              return {
                direction: pred.direction,
                rationale: pred.rationale,
                imagePrompt: pred.imagePrompt,
                imageUrl: imgData.data.imageUrl,
                seed: imgData.data.seed,
              } as PredictionRecord;
            } else {
              setImageStates((prev) => {
                const next = [...prev];
                next[i] = { status: "error", error: imgData.error || "生成失败" };
                return next;
              });
              return null;
            }
          })
          .catch(() => {
            setProgress((p) => ({ ...p, done: p.done + 1 }));
            setImageStates((prev) => {
              const next = [...prev];
              next[i] = { status: "error", error: "网络连接失败" };
              return next;
            });
            return null;
          })
      );

      const results = await Promise.all(promises);
      const records = results.filter((r): r is PredictionRecord => r !== null);

      setRecordedImages(records);
      setStep("result");

      if (records.length > 0) {
        const historyItem: OngoingHistoryItem = {
          id: uuid(),
          showTitle: selectedShow.title,
          showInfo: selectedShow,
          showStatus: "ongoing",
          createdAt: new Date().toISOString(),
          type: "prediction",
          predictions: records,
        };
        addItem(historyItem);
      }
    } catch {
      showToast("网络连接失败，请重试", "error");
    }
  }, [selectedShow, showToast, addItem]);

  const handleReselect = useCallback(
    async (index: number) => {
      if (!selectedShow || reselectedIndex !== null) return;
      setReselectedIndex(index);

      setImageStates((prev) => {
        const next = [...prev];
        next[index] = { status: "loading" };
        return next;
      });

      try {
        const excludeDirections = predictions.map((p) => p.direction);
        const res = await fetch("/api/regenerate-direction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showTitle: selectedShow.title,
            showSummary: selectedShow.summary,
            showGenres: selectedShow.genres,
            currentStatus: selectedShow.statusDetail,
            excludeDirections,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          showToast(data.error || "生成新方向失败", "error");
          setImageStates((prev) => {
            const next = [...prev];
            next[index] = { status: "error", error: data.error };
            return next;
          });
          return;
        }

        const newDirection: PredictionDirection = data.data;
        setPredictions((prev) => {
          const next = [...prev];
          next[index] = newDirection;
          return next;
        });

        const imgRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: newDirection.imagePrompt }),
        });
        const imgData = await imgRes.json();

        if (imgData.success) {
          setImageStates((prev) => {
            const next = [...prev];
            next[index] = { status: "success", imageUrl: imgData.data.imageUrl, seed: imgData.data.seed };
            return next;
          });

          const newRecord: PredictionRecord = {
            direction: newDirection.direction,
            rationale: newDirection.rationale,
            imagePrompt: newDirection.imagePrompt,
            imageUrl: imgData.data.imageUrl,
            seed: imgData.data.seed,
          };

          setRecordedImages((prev) => {
            const next = [...prev];
            next[index] = newRecord;
            return next;
          });

          const historyItem: OngoingHistoryItem = {
            id: uuid(),
            showTitle: selectedShow.title,
            showInfo: selectedShow,
            showStatus: "ongoing",
            createdAt: new Date().toISOString(),
            type: "prediction",
            predictions: recordedImages.map((r, i) => (i === index ? newRecord : r)),
          };
          addItem(historyItem);
        } else {
          setImageStates((prev) => {
            const next = [...prev];
            next[index] = { status: "error", error: imgData.error || "图片生成失败" };
            return next;
          });
        }
      } catch {
        showToast("网络连接失败", "error");
        setImageStates((prev) => {
          const next = [...prev];
          next[index] = { status: "error", error: "网络连接失败" };
          return next;
        });
      } finally {
        setReselectedIndex(null);
      }
    },
    [selectedShow, predictions, recordedImages, reselectedIndex, showToast, addItem]
  );

  if (!selectedShow) return null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)] px-4 py-8 sm:py-12">
      {/* Dimensional background */}
      <div className="dimensional-bg" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <ShowDetail show={selectedShow} compact />

        {/* Loading predictions */}
        {step === "loading_predictions" && (
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-purple-500/20 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "15s" }} />
              <div className="absolute inset-4 rounded-full border border-amber-500/10 animate-spin-slow" style={{ animationDuration: "10s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            </div>
            <p className="text-white/40 text-sm">正在穿越时间线，搜索平行世界的蛛丝马迹...</p>
            <p className="text-white/20 text-xs">{selectedShow.title}</p>
          </div>
        )}

        {/* Generating images */}
        {step === "generating_images" && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold shimmer-text">平行世界的 5 条路线</h2>
              <p className="text-white/30 text-sm">
                正在从量子泡沫中投影画面... {progress.done}/{progress.total}
              </p>
              {/* Progress bar */}
              <div className="w-48 mx-auto h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <PredictionGrid
              predictions={predictions.map((p, i) => ({
                direction: p,
                imageState: imageStates[i] || { status: "loading" },
              }))}
              onReselect={handleReselect}
              reselectingIndex={reselectedIndex}
            />
          </div>
        )}

        {/* Result */}
        {step === "result" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold shimmer-text">平行世界的 5 条路线</h2>
              <p className="text-white/30 text-sm">
                基于多元宇宙网络讨论生成 · 点击"换个走向"探索更多可能
              </p>
            </div>
            <PredictionGrid
              predictions={predictions.map((p, i) => ({
                direction: p,
                imageState: imageStates[i] || { status: "loading" },
              }))}
              onReselect={handleReselect}
              reselectingIndex={reselectedIndex}
            />
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => { hasStarted.current = false; generatePredictions(); }}>
                重新校准时间线
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
