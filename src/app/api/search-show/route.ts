import { NextResponse } from "next/server";
import { z } from "zod";
import { searchShowWithDeepSeek, toShowInfo } from "@/lib/api/show-info";
import { lookupPoster } from "@/lib/api/douban";
import { isDeepSeekAuthError } from "@/lib/api/deepseek";
import type { ShowInfo, ShowSearchResult } from "@/lib/types";

const requestSchema = z.object({
  query: z.string().min(1, "请输入剧集名称").max(100),
});

export async function POST(request: Request) {
  try {
    const { query } = requestSchema.parse(await request.json());

    // Primary: DeepSeek for accurate show info + status
    const result = await searchShowWithDeepSeek(query);

    // Secondary: Douban for poster images (best-effort, don't block on failure)
    const posterPromise = lookupPoster(query).catch(() => null);

    if (result.matchType === "single") {
      const poster = await posterPromise;
      const showInfo = toShowInfo(
        result.show,
        poster?.posterUrl || "",
        poster?.doubanId || ""
      );

      return NextResponse.json({
        success: true,
        data: {
          shows: [toSearchResult(showInfo)],
          exactMatch: showInfo,
        },
      });
    }

    // Multiple matches: return list for user to pick
    const poster = await posterPromise;

    const shows: ShowSearchResult[] = result.shows.map((s) => {
      const info = toShowInfo(s, poster?.posterUrl || "", poster?.doubanId || "");
      return toSearchResult(info);
    });

    return NextResponse.json({
      success: true,
      data: { shows },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "请输入有效的剧集名称", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    if (isDeepSeekAuthError(error)) {
      return NextResponse.json(
        { success: false, error: "DeepSeek API Key 无效，请检查 .env.local", code: "DEEPSEEK_AUTH_ERROR" },
        { status: 500 }
      );
    }

    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "搜索服务暂时不可用，请稍后再试", code: "SEARCH_ERROR" },
      { status: 502 }
    );
  }
}

function toSearchResult(info: ShowInfo): ShowSearchResult {
  return {
    doubanId: info.doubanId,
    title: info.title,
    year: info.year,
    posterUrl: info.posterUrl,
    rating: info.rating,
    genres: info.genres,
    status: info.status,
  };
}
