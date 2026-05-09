import OpenAI from "openai";

let client: OpenAI | null = null;

export function isDeepSeekAuthError(error: unknown): boolean {
  if (error instanceof OpenAI.AuthenticationError) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("401") || msg.includes("Authentication Fails");
}

export function deepSeekErrorResponse(error: unknown) {
  if (isDeepSeekAuthError(error)) {
    return {
      success: false as const,
      error: "DeepSeek API Key 无效，请检查 .env.local 中的 DEEPSEEK_API_KEY",
      code: "DEEPSEEK_AUTH_ERROR",
    };
  }
  return {
    success: false as const,
    error: "AI 生成失败，请重试",
    code: "DEEPSEEK_ERROR",
  };
}

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
      baseURL: "https://www.packyapi.com/v1",
      timeout: 120_000,
      maxRetries: 2,
    });
  }
  return client;
}

export interface ChatCompletionParams {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export async function chatCompletion(
  params: ChatCompletionParams
): Promise<string> {
  const deepseek = getClient();
  const response = await deepseek.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    temperature: params.temperature ?? 0.8,
    max_tokens: params.maxTokens ?? 4096,
    response_format: params.jsonMode
      ? { type: "json_object" }
      : { type: "text" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty response");
  return content;
}

export async function chatCompletionWithRetry(
  params: ChatCompletionParams,
  maxRetries = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await chatCompletion(params);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("DeepSeek request failed");
}
