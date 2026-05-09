import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative", { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size])}>
        <div className="absolute inset-0 rounded-full border border-purple-500/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 border-r-blue-400 animate-spin" />
      </div>
      {label && <p className="text-sm text-white/30 animate-pulse">{label}</p>}
    </div>
  );
}
