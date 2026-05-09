"use client";

import { useState, useCallback } from "react";
import type { ImageGenState } from "@/lib/types";

export function useImageGeneration() {
  const [state, setState] = useState<ImageGenState>({ status: "idle" });

  const generate = useCallback(async (prompt: string, seed?: number) => {
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, seed }),
      });

      const data = await res.json();

      if (!data.success) {
        setState({ status: "error", error: data.error || "生成失败" });
        return null;
      }

      const result = { imageUrl: data.data.imageUrl, seed: data.data.seed };
      setState({
        status: "success",
        imageUrl: result.imageUrl,
        seed: result.seed,
      });
      return result;
    } catch {
      setState({ status: "error", error: "网络连接失败，请重试" });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, generate, reset };
}
