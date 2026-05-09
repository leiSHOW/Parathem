export default function LoadingPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border border-purple-500/10 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-blue-500/10 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "12s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-purple-400 animate-spin" />
          </div>
        </div>
        <p className="text-white/25 text-sm">穿越时间线中...</p>
      </div>
    </div>
  );
}
