import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary", size = "md", loading, disabled, className, children, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300",
        "min-h-[44px] min-w-[44px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060f]",
        "disabled:pointer-events-none disabled:opacity-40",
        {
          primary: "bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40",
          secondary: "border border-purple-500/20 bg-purple-500/5 text-purple-200 hover:bg-purple-500/10 hover:border-purple-500/30 backdrop-blur-sm",
          ghost: "text-white/40 hover:text-white/80 hover:bg-white/[0.03]",
          danger: "bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20",
        }[variant],
        { sm: "px-4 py-2 text-sm", md: "px-6 py-2.5 text-base", lg: "px-8 py-3 text-lg" }[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
