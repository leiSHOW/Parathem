"use client";

import type { PredictionDirection, ImageGenState } from "@/lib/types";
import { PredictionCard } from "@/components/PredictionCard";

interface PredictionGridProps {
  predictions: { direction: PredictionDirection; imageState: ImageGenState }[];
  onReselect: (index: number) => void;
  reselectingIndex: number | null;
}

export function PredictionGrid({
  predictions,
  onReselect,
  reselectingIndex,
}: PredictionGridProps) {
  if (predictions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {predictions.map((item, index) => (
        <PredictionCard
          key={item.direction.id}
          direction={item.direction}
          imageState={item.imageState}
          onReselect={() => onReselect(index)}
          isReselecting={reselectingIndex === index}
        />
      ))}
    </div>
  );
}
