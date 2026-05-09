// ===== Douban / Show Data =====
export interface ShowInfo {
  doubanId: string;
  title: string;
  originalTitle?: string;
  year: number;
  posterUrl: string;
  rating: number;
  genres: string[];
  directors: string[];
  actors: string[];
  summary: string;
  episodeCount?: number;
  status: ShowStatus;
  statusDetail: string;
}

export type ShowStatus = "ended" | "ongoing" | "unknown";

export interface ShowSearchResult {
  doubanId: string;
  title: string;
  year: number;
  posterUrl: string;
  rating: number;
  genres: string[];
  status: ShowStatus;
}

// ===== AI Responses =====
export interface EndingGenerationResult {
  narrativeText: string;
  imagePrompt: string;
}

export interface PredictionDirection {
  id: string;
  direction: string;
  rationale: string;
  imagePrompt: string;
}

export interface PredictionSet {
  predictions: PredictionDirection[];
}

// ===== Image Generation =====
export interface ImageGenerationResult {
  imageUrl: string;
  seed: number;
}

export interface ImageGenState {
  status: "idle" | "loading" | "success" | "error";
  imageUrl?: string;
  seed?: number;
  error?: string;
}

// ===== History (localStorage) =====
export type HistoryItem = EndedHistoryItem | OngoingHistoryItem;

export interface EndedHistoryItem {
  id: string;
  showTitle: string;
  showInfo: ShowInfo;
  showStatus: "ended";
  createdAt: string;
  type: "ending";
  userEnding: string;
  narrativeText: string;
  imagePrompt: string;
  images: ImageRecord[];
}

export interface OngoingHistoryItem {
  id: string;
  showTitle: string;
  showInfo: ShowInfo;
  showStatus: "ongoing";
  createdAt: string;
  type: "prediction";
  predictions: PredictionRecord[];
}

export interface ImageRecord {
  url: string;
  seed: number;
  imagePrompt: string;
}

export interface PredictionRecord {
  direction: string;
  rationale: string;
  imagePrompt: string;
  imageUrl: string;
  seed: number;
}

// ===== API Request / Response =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
