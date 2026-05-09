import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({
  hover = false,
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 sm:p-6",
        hover && "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:scale-[1.02]",
        glow && "shadow-lg shadow-purple-900/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
