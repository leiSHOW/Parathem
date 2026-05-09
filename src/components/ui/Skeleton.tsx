import { cn } from "@/lib/utils/cn";

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-xl bg-white/[0.03] border border-white/[0.03]", className)} />;
}

export function ImageSkeleton() {
  return (
    <div className="w-full aspect-square rounded-xl bg-white/[0.02] border border-purple-500/10 flex flex-col items-center justify-center gap-3 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-blue-900/5 animate-pulse" />
      <div className="relative z-10 w-8 h-8 rounded-full border border-purple-500/20 border-t-purple-400 animate-spin" />
      <p className="relative z-10 text-xs text-white/20">投射中...</p>
    </div>
  );
}
