import { NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, isOpenAIAuthError } from "@/lib/api/openai-image";

const requestSchema = z.object({
  prompt: z.string().min(10, "图片描述太短"),
  seed: z.number().int().optional(),
});

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const params = requestSchema.parse(await request.json());

    const result = await generateImage({
      prompt: params.prompt,
      seed: params.seed,
    });

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.imageUrl,
        seed: result.seed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "请输入有效的图片描述", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    if (isOpenAIAuthError(error)) {
      return NextResponse.json(
        { success: false, error: "OpenAI API Key 无效，请检查 .env.local 中的 OPENAI_API_KEY", code: "OPENAI_AUTH_ERROR" },
        { status: 500 }
      );
    }

    const errMsg = error instanceof Error ? error.message : String(error);

    if (errMsg.includes("content_policy") || errMsg.includes("safety")) {
      return NextResponse.json(
        { success: false, error: "图片内容涉及敏感信息，请修改描述后重试", code: "CONTENT_FILTERED" },
        { status: 400 }
      );
    }

    if (errMsg.includes("rate") || errMsg.includes("429")) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后再试", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: "图片生成失败，请重试", code: "OPENAI_IMAGE_ERROR" },
      { status: 500 }
    );
  }
}
