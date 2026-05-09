export function buildEndingSystemPrompt(): string {
  return `你是一个专业的影视编剧和视觉场景设计师。用户会提供一部电视剧的信息和他们想要的替代结局。

请生成一个json对象，包含以下字段：
1. "narrativeText": 一段200-300字的中文叙事，生动描述这个替代结局的场景，富有文学感和画面感
2. "imagePrompt": 一段100-200词的英文描述，用于AI图像生成。必须是写实风格（photorealistic）。包括：角色外貌描述、场景环境、光线氛围、色调、镜头角度、情绪、细节。使用"photorealistic, cinematic lighting, 8K, highly detailed"等关键词。

重要：imagePrompt必须是纯英文（不超过200词），专注于视觉描述而非情节叙述。描述要足够详细以确保生成出高质量的写实图片。`;
}

export function buildEndingUserPrompt(params: {
  showTitle: string;
  showSummary: string;
  showGenres: string[];
  originalEnding: string;
  userEnding: string;
}): string {
  return `电视剧: ${params.showTitle}
类型: ${params.showGenres.join("、") || "未知"}
剧情简介: ${params.showSummary || "未知"}
原结局: ${params.originalEnding || "未知"}

用户想要的替代结局:
${params.userEnding}

请生成json响应，包含narrativeText和imagePrompt两个字段。`;
}
