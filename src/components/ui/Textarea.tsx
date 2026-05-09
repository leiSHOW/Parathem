"use client";

import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string; maxLength?: number; showCount?: boolean;
}

export const Textarea = forwardRef(function Textarea(
  { className, error, maxLength, showCount, value, ...props }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const charCount = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full">
      <textarea ref={ref}
        className={cn(
          "w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-white placeholder:text-white/15",
          "min-h-[120px] resize-y backdrop-blur-sm",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent",
          "transition-all duration-300",
          error ? "border-red-500/30 focus:ring-red-500" : "border-white/[0.06] hover:border-white/[0.12]",
          className
        )}
        value={value} {...props}
      />
      {(showCount || maxLength || error) && (
        <div className="flex justify-between mt-1.5">
          {error ? <p className="text-sm text-red-400/80">{error}</p> : <span />}
          {maxLength && (
            <p className={cn("text-xs", charCount > maxLength * 0.9 ? "text-red-400" : "text-white/15")}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
