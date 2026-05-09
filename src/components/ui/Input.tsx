"use client";

import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, ForwardedRef } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { error?: string; }

export const Input = forwardRef(function Input(
  { className, error, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  return (
    <div className="w-full">
      <input ref={ref}
        className={cn(
          "w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-white placeholder:text-white/15",
          "min-h-[44px] backdrop-blur-sm",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent",
          "transition-all duration-300",
          error ? "border-red-500/30 focus:ring-red-500" : "border-white/[0.06] hover:border-white/[0.12]",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-400/80">{error}</p>}
    </div>
  );
});
