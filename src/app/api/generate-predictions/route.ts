import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletionWithRetry, isDeepSeekAuthError } from "@/lib/api/deepseek";
import {
  buildPredictionSystemPrompt,
  buildPredictionUserPrompt,
} from "@/lib/prompts/prediction-generation";
import type { PredictionSet, PredictionDirection } from "@/lib/types";

const requestSchema = z.object({
  showTitle: z.string().min(1),
  showSummary: z.string(),
  showGenres: z.array(z.string()),
  currentStatus: z.string(),
});

export async function POST(request: Request) {
  try {
    const params = requestSchema.parse(await request.json());

    const systemPrompt = buildPredictionSystemPrompt();
    const userPrompt = buildPredictionUserPrompt(params);

    const content = await chatCompletionWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.9,
    });

    let parsed: { predictions: Array<{ direction: string; rationale: string; imagePrompt: string }> };
    try {
      parsed = JSON.parse(content);
    } catch {
      const retryContent = await chatCompletionWithRetry({
        systemPrompt: buildPredictionSystemPrompt() + "\n\n你必须只返回有效的JSON。",
        userPrompt: userPrompt + "\n\n请只返回有效的JSON对象。",
        jsonMode: true,
        temperature: 0.7,
      });

      try {
        parsed = JSON.parse(retryContent);
      } catch {
        return NextResponse.json(
          { success: false, error: "预测生成失败，请重试", code: "DEEPSEEK_ERROR" },
          { status: 500 }
        );
      }
    }

    if (!parsed.predictions || !Array.isArray(parsed.predictions) || parsed.predictions.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI返回数据不完整，请重试", code: "DEEPSEEK_ERROR" },
        { status: 500 }
      );
    }

    const predictions: PredictionDirection[] = parsed.predictions
      .slice(0, 5)
      .map((p) => {
        let imagePrompt = p.imagePrompt;
        if (!/photorealistic|realistic|cinematic/i.test(imagePrompt)) {
          imagePrompt = `photorealistic, cinematic lighting, 8K, highly detailed. ${imagePrompt}`;
        }

        return {
          id: uuid(),
          direction: p.direction,
          rationale: p.rationale,
          imagePrompt,
        };
      });

    const result: PredictionSet = { predictions };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "请提供完整的剧集信息", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }
    console.error("Prediction generation error:", error);
    if (isDeepSeekAuthError(error)) {
      return NextResponse.json(
        { success: false, error: "DeepSeek API Key 无效，请检查 .env.local 中的 DEEPSEEK_API_KEY", code: "DEEPSEEK_AUTH_ERROR" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "预测生成失败，请重试", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
