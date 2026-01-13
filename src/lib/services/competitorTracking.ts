// Service for tracking competitors from query results

import type { QueryResult } from '../types';
import { loadQueryResults } from './dataStorage';

export interface CompetitorMetrics {
  id: string;
  name: string;
  visibility: number; // 0-100 score
  mentions: number; // Total mentions
  sentiment: number; // 0-100 average sentiment
  growth: number; // Percentage change
  isUser: boolean;
}

export interface CompetitorConfig {
  name: string;
  aliases: string[];
}

// Competitor configuration
export const COMPETITORS: CompetitorConfig[] = [
  { name: 'findforsikring', aliases: ['findforsikring', 'find forsikring', 'findforsikring.dk'] },
  { name: 'fdm', aliases: ['fdm', 'FDM', 'FDM.dk'] },
  { name: 'alm. brand', aliases: ['alm. brand', 'alm brand', 'almbrand'] },
];

/**
 * Detect if a competitor is mentioned in AI response
 */
export function detectCompetitorMention(
  response: string,
  competitor: CompetitorConfig
): { mentioned: boolean; position: number | null; sentiment: 'positive' | 'neutral' | 'negative' } {
  const lowerResponse = response.toLowerCase();
  let mentioned = false;
  let position: number | null = null;
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';

  // Check for mentions
  for (const alias of competitor.aliases) {
    const index = lowerResponse.indexOf(alias.toLowerCase());
    if (index !== -1) {
      mentioned = true;
      if (position === null || index < position) {
        position = Math.floor(index / 50) + 1; // Approximate position
      }
    }
  }

  if (mentioned && position) {
    // Simple sentiment analysis around mention
    const contextStart = Math.max(0, position * 50 - 100);
    const contextEnd = Math.min(response.length, position * 50 + 100);
    const context = response.substring(contextStart, contextEnd).toLowerCase();

    const positiveWords = ['best', 'excellent', 'great', 'recommended', 'top', 'leading', 'preferred'];
    const negativeWords = ['worst', 'poor', 'bad', 'avoid', 'issues', 'problems', 'complaints'];

    const positiveCount = positiveWords.filter(word => context.includes(word)).length;
    const negativeCount = negativeWords.filter(word => context.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
  }

  return { mentioned, position, sentiment };
}

/**
 * Calculate competitor metrics from query results
 */
export function calculateCompetitorMetrics(
  competitor: CompetitorConfig,
  queryResults: QueryResult[]
): CompetitorMetrics {
  // Use competitorMentions field if available, otherwise fall back to context search
  const competitorResults = queryResults.filter(result => {
    if (result.competitorMentions) {
      return result.competitorMentions.includes(competitor.name);
    }
    // Fallback: search in context
    const lowerContext = (result.context || '').toLowerCase();
    return competitor.aliases.some(alias => lowerContext.includes(alias.toLowerCase()));
  });

  const mentions = competitorResults.length;
  const mentionedResults = competitorResults.filter(r => r.mentioned);
  
  // Calculate visibility score (0-100)
  // Based on mention rate, position, and sentiment
  let visibility = 0;
  if (queryResults.length > 0) {
    const mentionRate = (mentionedResults.length / queryResults.length) * 100;
    const avgPosition = mentionedResults.length > 0
      ? mentionedResults.reduce((sum, r) => sum + (r.position || 10), 0) / mentionedResults.length
      : 10;
    const positionScore = Math.max(0, 100 - (avgPosition - 1) * 10);
    visibility = (mentionRate * 0.6) + (positionScore * 0.4);
  }

  // Calculate average sentiment (0-100)
  const sentimentScores = mentionedResults.map(r => {
    if (r.sentiment === 'positive') return 80;
    if (r.sentiment === 'negative') return 30;
    return 50;
  });
  const sentiment = sentimentScores.length > 0
    ? sentimentScores.reduce((sum, s) => sum + s, 0) / sentimentScores.length
    : 50;

  // Calculate growth (placeholder - would need historical data)
  const growth = 0; // TODO: Calculate from historical comparison

  return {
    id: competitor.name.toLowerCase().replace(/\s+/g, '-'),
    name: competitor.name,
    visibility: Math.round(visibility),
    mentions: mentions,
    sentiment: Math.round(sentiment),
    growth,
    isUser: false,
  };
}

/**
 * Get all competitor metrics from stored query results
 */
export function getAllCompetitorMetrics(): CompetitorMetrics[] {
  const queryResults = loadQueryResults();
  const competitors = COMPETITORS.map(competitor =>
    calculateCompetitorMetrics(competitor, queryResults)
  );
  return competitors;
}

/**
 * Get your brand metrics from stored query results
 */
export function getYourBrandMetrics(): CompetitorMetrics {
  const queryResults = loadQueryResults();
  const yourBrandConfig: CompetitorConfig = {
    name: 'Samlino',
    aliases: ['Samlino', 'samlino', 'samlino.dk', 'samlino dk'],
  };
  
  return {
    ...calculateCompetitorMetrics(yourBrandConfig, queryResults),
    isUser: true,
  };
}

/**
 * Get all metrics including your brand
 */
export function getAllMetrics(): CompetitorMetrics[] {
  const yourBrand = getYourBrandMetrics();
  const competitors = getAllCompetitorMetrics();
  return [yourBrand, ...competitors].sort((a, b) => b.visibility - a.visibility);
}
