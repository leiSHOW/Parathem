import type { HistoryItem } from "@/lib/types";

const HISTORY_KEY = "parathem-history";
const MAX_HISTORY_ITEMS = 50;

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  const trimmed = items.slice(-MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      const halved = trimmed.slice(-Math.floor(MAX_HISTORY_ITEMS / 2));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(halved));
    }
  }
}

export function addHistoryItem(item: HistoryItem): void {
  const history = loadHistory();
  history.push(item);
  saveHistory(history);
}

export function deleteHistoryItem(id: string): void {
  const history = loadHistory().filter((h) => h.id !== id);
  saveHistory(history);
}
