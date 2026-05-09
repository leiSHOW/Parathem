"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5 relative z-10">
        <div className="text-6xl opacity-30">?</div>
        <h2 className="text-xl font-semibold text-white/80">时间线出现扰动</h2>
        <p className="text-white/30 text-sm">平行世界暂时不可达，请稍后再试</p>
        <Button variant="secondary" onClick={reset}>重新尝试</Button>
      </div>
    </div>
  );
}
