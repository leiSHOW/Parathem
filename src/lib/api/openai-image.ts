import OpenAI from "openai";

let client: OpenAI | null = null;

export function isOpenAIAuthError(error: unknown): boolean {
  if (error instanceof OpenAI.AuthenticationError) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("401") || msg.includes("Incorrect API key") || msg.includes("authentication");
}

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
      baseURL: "https://www.packyapi.com/v1",
      timeout: 360_000,
      maxRetries: 1,
    });
  }
  return client;
}

export interface GenerateImageParams {
  prompt: string;
  seed?: number;
}

export interface GenerateImageResult {
  imageUrl: string;
  seed: number;
}

export async function generateImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  const openai = getClient();
  const response = await openai.images.generate({
    model: "gpt-image-2",
    prompt: params.prompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
    response_format: "url",
    // @ts-expect-error -- seed may not be in SDK types yet
    seed: params.seed,
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL in OpenAI response");

  const seed = params.seed ?? Math.floor(Math.random() * 2147483647);

  return { imageUrl, seed };
}
