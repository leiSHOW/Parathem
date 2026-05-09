import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletionWithRetry, isDeepSeekAuthError } from "@/lib/api/deepseek";
import {
  buildRegenerateDirectionSystemPrompt,
  buildRegenerateDirectionUserPrompt,
} from "@/lib/prompts/prediction-generation";
import type { PredictionDirection } from "@/lib/types";

const requestSchema = z.object({
  showTitle: z.string().min(1),
  showSummary: z.string(),
  showGenres: z.array(z.string()),
  currentStatus: z.string(),
  excludeDirections: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const params = requestSchema.parse(await request.json());

    const systemPrompt = buildRegenerateDirectionSystemPrompt();
    const userPrompt = buildRegenerateDirectionUserPrompt(params);

    const content = await chatCompletionWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.95,
    });

    let parsed: { direction: string; rationale: string; imagePrompt: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      const retryContent = await chatCompletionWithRetry({
        systemPrompt: systemPrompt + "\n\n只返回有效JSON。",
        userPrompt: userPrompt + "\n\n只返回有效JSON对象。",
        jsonMode: true,
        temperature: 0.7,
      });

      try {
        parsed = JSON.parse(retryContent);
      } catch {
        return NextResponse.json(
          { success: false, error: "生成新方向失败，请重试", code: "DEEPSEEK_ERROR" },
          { status: 500 }
        );
      }
    }

    if (!parsed.direction || !parsed.imagePrompt) {
      return NextResponse.json(
        { success: false, error: "AI返回数据不完整，请重试", code: "DEEPSEEK_ERROR" },
        { status: 500 }
      );
    }

    let imagePrompt = parsed.imagePrompt;
    if (!/photorealistic|realistic|cinematic/i.test(imagePrompt)) {
      imagePrompt = `photorealistic, cinematic lighting, 8K, highly detailed. ${imagePrompt}`;
    }

    const result: PredictionDirection = {
      id: uuid(),
      direction: parsed.direction,
      rationale: parsed.rationale,
      imagePrompt,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "请提供完整的请求信息", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }
    console.error("Regenerate direction error:", error);
    if (isDeepSeekAuthError(error)) {
      return NextResponse.json(
        { success: false, error: "DeepSeek API Key 无效，请检查 .env.local 中的 DEEPSEEK_API_KEY", code: "DEEPSEEK_AUTH_ERROR" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "生成新方向失败，请重试", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
