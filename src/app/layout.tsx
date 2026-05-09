import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Parathem — 平行世界的他们",
  description: "输入一部剧，看看它在平行世界里会走向哪里。穿越时间线，探索另一种结局。",
  keywords: ["平行世界", "结局生成", "AI", "影视剧", "Parathem", "多重宇宙"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#06060f] text-[#f0e6ff]">
        <Providers>
          {/* Global dimensional background */}
          <div className="dimensional-bg" />
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
