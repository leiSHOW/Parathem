import { chatCompletionWithRetry } from "@/lib/api/deepseek";
import type { ShowInfo, ShowStatus } from "@/lib/types";

interface DeepSeekShowResult {
  title: string;
  year: number;
  seasonCount: number;
  actors: string[];
  genres: string[];
  summary: string;
  status: "ended" | "ongoing";
  statusDetail: string;
}

const SYSTEM_PROMPT = `你是一个专业的影视数据库查询助手。用户会输入一个电视剧或网络剧的名称。

请查询该剧集的最新信息，返回JSON格式。规则：
- 如果只有一部剧匹配，返回单条完整信息
- 如果用户输入的名称有歧义（可能匹配多部剧），返回数组
- 如果无法找到任何匹配的剧集，返回 {"matchType":"none"}
- "status"字段必须准确："ended"表示已完结（全季播完），"ongoing"表示还在更新中
- "statusDetail"用中文描述，如"已完结, 共54集"、"更新至第18集"、"第3季完结, 第4季待播"
- "actors"列出主要演员（3-5位）
- "genres"列出剧集类型
- "summary"用50-100字概括剧情

返回格式（单个匹配）：
{"matchType":"single","show":{"title":"琅琊榜","year":2015,"seasonCount":1,"actors":["胡歌","刘涛","王凯"],"genres":["古装","权谋"],"summary":"梅长苏以病弱之躯重返帝都，辅佐靖王夺嫡。","status":"ended","statusDetail":"已完结, 共54集"}}

返回格式（多个匹配）：
{"matchType":"multiple","shows":[{"title":"琅琊榜","year":2015,...},{"title":"琅琊榜之风起长林","year":2017,...}]}

返回格式（无匹配）：
{"matchType":"none"}

请只在JSON中返回数据，不要包含任何其他文字。`;

export function buildShowSearchUserPrompt(query: string): string {
  return `请查询以下剧集的信息：${query}`;
}

export async function searchShowWithDeepSeek(
  query: string
): Promise<{ matchType: "single"; show: DeepSeekShowResult } | { matchType: "multiple"; shows: DeepSeekShowResult[] }> {
  const content = await chatCompletionWithRetry({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildShowSearchUserPrompt(query),
    jsonMode: true,
    temperature: 0.3,
  });

  const parsed = JSON.parse(content);

  if (parsed.matchType === "none") {
    return { matchType: "multiple", shows: [] };
  }
  if (parsed.matchType === "single" && parsed.show) {
    return { matchType: "single", show: parsed.show };
  }
  if (parsed.matchType === "multiple" && Array.isArray(parsed.shows)) {
    return { matchType: "multiple", shows: parsed.shows };
  }

  throw new Error("DeepSeek returned unexpected show search format");
}

export function toShowInfo(show: DeepSeekShowResult, posterUrl = "", doubanId = ""): ShowInfo {
  return {
    doubanId,
    title: show.title,
    year: show.year,
    posterUrl,
    rating: 0,
    genres: show.genres || [],
    directors: [],
    actors: show.actors || [],
    summary: show.summary || "",
    episodeCount: show.seasonCount,
    status: show.status as ShowStatus,
    statusDetail: show.statusDetail || "",
  };
}
