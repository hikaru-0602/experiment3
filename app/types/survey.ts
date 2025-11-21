export interface SearchResult {
  id: string;
  name: string;
  location: string;
  text_similarity: number;
  image_similarity: number;
  integrated_score: number;
  explain: string;
  word: string[];
  caption_ja: string;
  ratio: number; // 0: テキストのみ, 1: 統合, 2: 画像のみ
}

export interface QuerySet {
  id: number;
  query_text: string;
  query_image_url: string;
  result: SearchResult[]; // 3つの結果を含む配列（既にシャッフル済み）
}

export interface Results {
  results: QuerySet[];
}

export interface Answer {
  relevance: number; // Q1: 1-5
  dominantInfo: 'text' | 'image' | 'both' | null; // Q2
}
