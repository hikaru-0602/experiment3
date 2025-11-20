export interface SearchResult {
  id: string;
  name: string;
  location: string;
  text_similarity: number;
  image_similarity: number;
  integrated_score: number;
}

export interface QuerySet {
  id: number;
  query_text: string;
  query_image_url: string;
  text_100_image_0: SearchResult;
  text_50_image_50: SearchResult;
  text_0_image_100: SearchResult;
}

export interface BatchSearchResults {
  results: QuerySet[];
}

export interface Answer {
  relevance: number; // Q1: 1-5
  dominantInfo: 'text' | 'image' | 'both' | null; // Q2
}

export interface ResultAnswer {
  text_100_image_0: Answer;
  text_50_image_50: Answer;
  text_0_image_100: Answer;
}
