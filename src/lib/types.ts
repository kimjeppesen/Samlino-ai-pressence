// Type definitions for query data and results

export type Platform = 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Query {
  id: string;
  query: string;
  platform?: Platform;
  date?: string;
  category?: string;
  intent?: string;
}

export interface QueryResult {
  id: string;
  query: string;
  platform: Platform;
  mentioned: boolean;
  position: number | null; // Position in the response (1 = first mention, null = not mentioned)
  sentiment: Sentiment;
  date: string;
  context: string; // Excerpt from AI response mentioning the brand
  fullResponse?: string; // Full AI response (optional, can be large)
  confidence?: number; // Confidence score 0-1
  competitorMentions?: string[]; // Competitors mentioned in the response
  urls?: string[]; // URLs found in the response (when brand is mentioned)
}

export interface ProcessedQuery extends Query {
  results: QueryResult[];
  processedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface BrandPresenceAnalysis {
  mentioned: boolean;
  position: number | null;
  sentiment: Sentiment; // Always 'neutral' now, kept for backward compatibility
  context: string;
  confidence: number;
  mentions: Array<{
    text: string;
    position: number;
  }>;
  competitorMentions?: string[]; // Competitors mentioned in the response
  urls?: string[]; // URLs found in the response
}
