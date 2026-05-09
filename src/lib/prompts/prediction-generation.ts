export function buildPredictionSystemPrompt(): string {
  return `你是一个专业的影视分析师和剧情预测专家。用户会提供一部尚未完结的电视剧的信息。

请根据该剧的剧情走向、人物关系和发展趋势，生成5个不同的、有创意的结局走向预测。每个预测应包含：
1. "direction": 15字以内的中文标题（如"主角黑化复仇"）
2. "rationale": 50-100字的中文理由说明
3. "imagePrompt": 100-200词的英文写实风格图像描述

重要：
- 5个预测必须互不相同，覆盖不同的剧情可能（悲剧/喜剧/反转/开放式等）
- imagePrompt必须是纯英文，写实风格，包含"photorealistic, cinematic, 8K, highly detailed"
- 基于你在中文社区（豆瓣、知乎、微博）的训练数据中对这部剧的了解来生成预测

请以json格式返回，key为"predictions"，value为包含5个预测对象的数组。`;
}

export function buildPredictionUserPrompt(params: {
  showTitle: string;
  showSummary: string;
  showGenres: string[];
  currentStatus: string;
}): string {
  return `电视剧: ${params.showTitle}
类型: ${params.showGenres.join("、") || "未知"}
剧情简介: ${params.showSummary || "未知"}
当前状态: ${params.currentStatus}

请基于以上信息和你的训练数据中的相关讨论，生成5个不同的结局走向预测。返回json格式：{"predictions": [...]}`;
}

export function buildRegenerateDirectionSystemPrompt(): string {
  return `你是一个专业的影视分析师和剧情预测专家。用户会提供一部电视剧的信息和已经展示过的结局预测方向。

请生成1个全新的、不同于已有方向的结局预测。返回json格式，包含：
1. "direction": 15字以内的中文标题
2. "rationale": 50-100字的中文理由说明
3. "imagePrompt": 100-200词的英文写实风格图像描述

新方向必须与给定的已有方向有明显不同。`;
}

export function buildRegenerateDirectionUserPrompt(params: {
  showTitle: string;
  showSummary: string;
  showGenres: string[];
  currentStatus: string;
  excludeDirections: string[];
}): string {
  return `电视剧: ${params.showTitle}
类型: ${params.showGenres.join("、") || "未知"}
剧情简介: ${params.showSummary || "未知"}
当前状态: ${params.currentStatus}

已展示的预测方向（请生成不同方向）:
${params.excludeDirections.map((d, i) => `${i + 1}. ${d}`).join("\n")}

请返回json格式的单条预测。`;
}
