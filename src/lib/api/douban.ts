const DOUBAN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://movie.douban.com/",
  Accept: "application/json",
};

interface DoubanSuggestItem {
  id: string;
  title: string;
  year: string;
  pic: { normal: string };
}

/** Try to get poster URL and doubanId from Douban suggest API. Returns null on any failure. */
export async function lookupPoster(query: string): Promise<{ posterUrl: string; doubanId: string } | null> {
  try {
    const url = `https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { headers: DOUBAN_HEADERS, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const items: DoubanSuggestItem[] = await response.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    return {
      posterUrl: items[0].pic?.normal || "",
      doubanId: items[0].id || "",
    };
  } catch {
    return null;
  }
}
