"use client";

import { Textarea } from "@/components/ui/Textarea";

interface EndingInputProps { value: string; onChange: (v: string) => void; disabled?: boolean; }

export function EndingInput({ value, onChange, disabled }: EndingInputProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div>
        <h3 className="text-white/80 text-lg font-semibold mb-1">在平行世界里...</h3>
        <p className="text-white/25 text-sm">
          描述你想要的结局。这条时间线里，故事会如何收场？
        </p>
      </div>
      <Textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="例如：主角没有在那场战役中倒下，而是一人一马消失在风雪中。多年后，南方的茶馆里有人说书人讲起..."
        maxLength={500} showCount disabled={disabled} rows={5}
      />
    </div>
  );
}
