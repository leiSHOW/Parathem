import { NextResponse } from "next/server";
import { z } from "zod";
import { chatCompletionWithRetry, isDeepSeekAuthError } from "@/lib/api/deepseek";
import {
  buildEndingSystemPrompt,
  buildEndingUserPrompt,
} from "@/lib/prompts/ending-generation";
import type { EndingGenerationResult } from "@/lib/types";

const requestSchema = z.object({
  showTitle: z.string().min(1),
  showSummary: z.string(),
  showGenres: z.array(z.string()),
  originalEnding: z.string(),
  userEnding: z.string().min(1, "请输入你想要的结局"),
});

export async function POST(request: Request) {
  try {
    const params = requestSchema.parse(await request.json());

    const systemPrompt = buildEndingSystemPrompt();
    const userPrompt = buildEndingUserPrompt({
      showTitle: params.showTitle,
      showSummary: params.showSummary,
      showGenres: params.showGenres,
      originalEnding: params.originalEnding || "未知，请根据剧集类型自行推测原结局",
      userEnding: params.userEnding,
    });

    const content = await chatCompletionWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.9,
    });

    let parsed: { narrativeText: string; imagePrompt: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      // Retry once with stronger prompt
      const retryContent = await chatCompletionWithRetry({
        systemPrompt: systemPrompt + "\n\n你必须只返回有效的JSON，不要包含任何其他文本。",
        userPrompt: userPrompt + "\n\n请只返回有效的JSON对象。",
        jsonMode: true,
        temperature: 0.7,
      });

      try {
        parsed = JSON.parse(retryContent);
      } catch {
        return NextResponse.json(
          { success: false, error: "AI生成失败，请重试", code: "DEEPSEEK_ERROR" },
          { status: 500 }
        );
      }
    }

    if (!parsed.narrativeText || !parsed.imagePrompt) {
      return NextResponse.json(
        { success: false, error: "AI返回数据不完整，请重试", code: "DEEPSEEK_ERROR" },
        { status: 500 }
      );
    }

    // Ensure imagePrompt is English and has realistic keywords
    let imagePrompt = parsed.imagePrompt;
    if (!/photorealistic|realistic|cinematic/i.test(imagePrompt)) {
      imagePrompt = `photorealistic, cinematic lighting, 8K, highly detailed. ${imagePrompt}`;
    }

    const result: EndingGenerationResult = {
      narrativeText: parsed.narrativeText,
      imagePrompt,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "请提供完整的剧集信息和结局描述", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }
    console.error("Ending generation error:", error);
    if (isDeepSeekAuthError(error)) {
      return NextResponse.json(
        { success: false, error: "DeepSeek API Key 无效，请检查 .env.local 中的 DEEPSEEK_API_KEY", code: "DEEPSEEK_AUTH_ERROR" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "结局生成失败，请重试", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
