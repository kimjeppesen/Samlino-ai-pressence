// Service for calculating metrics from real query results

import type { QueryResult } from '../types';
import { loadQueryResults } from './dataStorage';
import { getAllMetrics, getYourBrandMetrics } from './competitorTracking';
import { compareWithPrevious, getPreviousSnapshot } from './historicalTracking';

/**
 * Calculate overall visibility score from query results
 */
export function calculateOverallVisibility(queryResults: QueryResult[]): number {
  if (queryResults.length === 0) return 0;
  
  const mentioned = queryResults.filter(r => r.mentioned);
  const mentionRate = (mentioned.length / queryResults.length) * 100;
  
  // Factor in position (earlier mentions = higher score)
  const avgPosition = mentioned.length > 0
    ? mentioned.reduce((sum, r) => sum + (r.position || 10), 0) / mentioned.length
    : 10;
  const positionScore = Math.max(0, 100 - (avgPosition - 1) * 10);
  
  return Math.round((mentionRate * 0.6) + (positionScore * 0.4));
}

/**
 * Calculate total mentions
 */
export function calculateTotalMentions(queryResults: QueryResult[]): number {
  return queryResults.filter(r => r.mentioned).length;
}

/**
 * Calculate average sentiment score (0-100)
 */
export function calculateAvgSentiment(queryResults: QueryResult[]): number {
  const mentioned = queryResults.filter(r => r.mentioned);
  if (mentioned.length === 0) return 0;
  
  const sentimentScores = mentioned.map(r => {
    if (r.sentiment === 'positive') return 80;
    if (r.sentiment === 'negative') return 30;
    return 50;
  });
  
  return Math.round(sentimentScores.reduce((sum, s) => sum + s, 0) / sentimentScores.length);
}

/**
 * Calculate competitor ranking
 */
export function calculateCompetitorRank(): number {
  const allMetrics = getAllMetrics();
  const yourBrand = getYourBrandMetrics();
  const sorted = allMetrics.sort((a, b) => b.visibility - a.visibility);
  const rank = sorted.findIndex(m => m.isUser) + 1;
  return rank || 1;
}

/**
 * Calculate platform-specific metrics
 */
export function calculatePlatformMetrics(queryResults: QueryResult[], platform: string) {
  const platformResults = queryResults.filter(r => r.platform === platform);
  const mentioned = platformResults.filter(r => r.mentioned);
  
  const visibility = calculateOverallVisibility(platformResults);
  const mentions = mentioned.length;
  const sentiment = calculateAvgSentiment(platformResults);
  
  return {
    visibility,
    mentions,
    sentiment,
    total: platformResults.length,
  };
}

/**
 * Get all KPI data from real query results with historical comparison
 */
export function getKPIData(queryResults: QueryResult[]) {
  const overallVisibility = calculateOverallVisibility(queryResults);
  const totalMentions = calculateTotalMentions(queryResults);
  const avgSentiment = calculateAvgSentiment(queryResults);
  const competitorRank = calculateCompetitorRank();
  
  // Compare with previous snapshot
  const comparison = compareWithPrevious(queryResults);
  
  return {
    overallVisibility: {
      value: overallVisibility,
      change: comparison.overallVisibility.change,
      trend: comparison.overallVisibility.trend,
      label: 'Overall AI Visibility Score',
      description: comparison.hasComparison 
        ? `vs last week: ${comparison.overallVisibility.change > 0 ? '+' : ''}${comparison.overallVisibility.change}`
        : 'Across all monitored AI platforms',
    },
    totalMentions: {
      value: totalMentions,
      change: comparison.totalMentions.change,
      trend: comparison.totalMentions.trend,
      label: 'Total AI Mentions',
      description: comparison.hasComparison
        ? `vs last week: ${comparison.totalMentions.change > 0 ? '+' : ''}${comparison.totalMentions.change}`
        : `From ${queryResults.length} queries`,
    },
    avgSentiment: {
      value: avgSentiment,
      change: comparison.avgSentiment.change,
      trend: comparison.avgSentiment.trend,
      label: 'Sentiment Score',
      description: comparison.hasComparison
        ? `vs last week: ${comparison.avgSentiment.change > 0 ? '+' : ''}${comparison.avgSentiment.change}`
        : 'Positive mention rate',
    },
    competitorRank: {
      value: competitorRank,
      change: comparison.competitorRank.change,
      trend: comparison.competitorRank.trend,
      label: 'Competitor Ranking',
      description: comparison.hasComparison
        ? `vs last week: ${comparison.competitorRank.change > 0 ? '↓' : comparison.competitorRank.change < 0 ? '↑' : '→'} ${Math.abs(comparison.competitorRank.change)}`
        : 'In your industry category',
    },
    hasComparison: comparison.hasComparison,
  };
}

/**
 * Get platform data from real query results with historical comparison
 */
export function getPlatformData(queryResults: QueryResult[]) {
  const platforms = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'];
  const platformIcons: Record<string, string> = {
    ChatGPT: '🤖',
    Claude: '🧠',
    Perplexity: '🔍',
    Gemini: '✨',
  };
  
  const colors: Record<string, string> = {
    ChatGPT: 'hsl(var(--chart-1))',
    Claude: 'hsl(var(--chart-2))',
    Perplexity: 'hsl(var(--chart-3))',
    Gemini: 'hsl(var(--chart-4))',
  };
  
  // Get previous snapshot for comparison
  const previousSnapshot = getPreviousSnapshot();
  
  return platforms.map(platform => {
    const metrics = calculatePlatformMetrics(queryResults, platform);
    
    // Find previous metrics for this platform
    let change = 0;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (previousSnapshot) {
      const previousPlatform = previousSnapshot.platformMetrics.find(p => p.platform === platform);
      if (previousPlatform) {
        change = metrics.visibility - previousPlatform.visibility;
        if (change > 0) trend = 'up';
        else if (change < 0) trend = 'down';
        else trend = 'stable';
      }
    }
    
    return {
      id: platform.toLowerCase(),
      name: platform,
      icon: platformIcons[platform],
      visibility: metrics.visibility,
      mentions: metrics.mentions,
      sentiment: metrics.sentiment,
      change,
      trend,
      color: colors[platform],
    };
  });
}
