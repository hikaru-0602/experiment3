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
  result: SearchResult[]; // 5つの結果を含む配列（既にシャッフル済み）
}

export interface Results {
  results: QuerySet[];
}

export interface Answer {
  relevance: number; // Q1: 1-5
  dominantInfo: number; // Q2: 1-5 (1: テキストのみ, 3: 1:1で統合, 5: 画像のみ)
}

export interface QuerySetResult {
  querySetId: number;
  q1Answers: number[]; // 5つの結果に対するQ1の回答
  q2Answers: number[]; // 5つの結果に対するQ2の回答
}

export interface SurveyData {
  timestamp: string;
  querySets: QuerySetResult[];
}
