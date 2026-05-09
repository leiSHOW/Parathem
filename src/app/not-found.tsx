import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5 relative z-10">
        <div className="text-6xl opacity-30">?</div>
        <h2 className="text-xl font-semibold text-white/80">这条时间线不存在</h2>
        <p className="text-white/30 text-sm">你访问的坐标在所有平行宇宙中都没有记录</p>
        <Link href="/">
          <span className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 min-h-[44px] px-6 py-2.5 border border-purple-500/20 bg-purple-500/5 text-purple-200 hover:bg-purple-500/10 hover:border-purple-500/30 cursor-pointer">
            返回主时间线
          </span>
        </Link>
      </div>
    </div>
  );
}
