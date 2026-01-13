// Service for tracking historical metrics and weekly snapshots

import type { QueryResult } from '../types';
import { calculateOverallVisibility, calculateTotalMentions, calculateAvgSentiment, calculateCompetitorRank } from './metricsCalculator';
import { getPlatformData } from './metricsCalculator';
import { getAllMetrics } from './competitorTracking';

export interface HistoricalSnapshot {
  id: string;
  timestamp: string; // ISO date string
  date: string; // YYYY-MM-DD format
  week: string; // YYYY-WW format (e.g., "2024-15")
  metrics: {
    overallVisibility: number;
    totalMentions: number;
    avgSentiment: number;
    competitorRank: number;
    totalQueries: number;
  };
  platformMetrics: Array<{
    platform: string;
    visibility: number;
    mentions: number;
    sentiment: number;
  }>;
  competitorMetrics: Array<{
    name: string;
    visibility: number;
    mentions: number;
    sentiment: number;
  }>;
}

const STORAGE_KEY = 'ai-visibility-historical-snapshots';
const MAX_SNAPSHOTS = 52; // Keep 1 year of weekly data

/**
 * Get week number from date (ISO week)
 */
function getWeekNumber(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Create a snapshot from current query results
 */
export function createSnapshot(queryResults: QueryResult[]): HistoricalSnapshot {
  const now = new Date();
  const timestamp = now.toISOString();
  const date = now.toISOString().split('T')[0];
  const week = getWeekNumber(now);

  const overallVisibility = calculateOverallVisibility(queryResults);
  const totalMentions = calculateTotalMentions(queryResults);
  const avgSentiment = calculateAvgSentiment(queryResults);
  const competitorRank = calculateCompetitorRank();

  const platformData = getPlatformData(queryResults);
  const platformMetrics = platformData.map(p => ({
    platform: p.name,
    visibility: p.visibility,
    mentions: p.mentions,
    sentiment: p.sentiment,
  }));

  const allMetrics = getAllMetrics();
  const competitorMetrics = allMetrics.map(m => ({
    name: m.name,
    visibility: m.visibility,
    mentions: m.mentions,
    sentiment: m.sentiment,
  }));

  return {
    id: `snapshot-${timestamp}`,
    timestamp,
    date,
    week,
    metrics: {
      overallVisibility,
      totalMentions,
      avgSentiment,
      competitorRank,
      totalQueries: queryResults.length,
    },
    platformMetrics,
    competitorMetrics,
  };
}

/**
 * Save snapshot to localStorage
 */
export function saveSnapshot(snapshot: HistoricalSnapshot): void {
  try {
    const snapshots = loadAllSnapshots();
    
    // Check if snapshot for this week already exists
    const existingIndex = snapshots.findIndex(s => s.week === snapshot.week);
    
    if (existingIndex !== -1) {
      // Replace existing snapshot for this week
      snapshots[existingIndex] = snapshot;
    } else {
      // Add new snapshot
      snapshots.push(snapshot);
    }
    
    // Sort by timestamp (newest first)
    snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Keep only last MAX_SNAPSHOTS
    const trimmed = snapshots.slice(0, MAX_SNAPSHOTS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    console.log(`[Historical Tracking] Saved snapshot for week ${snapshot.week}, total snapshots: ${trimmed.length}`);
  } catch (error) {
    console.error('[Historical Tracking] Failed to save snapshot:', error);
  }
}

/**
 * Load all historical snapshots
 */
export function loadAllSnapshots(): HistoricalSnapshot[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const snapshots = JSON.parse(stored);
      // Sort by timestamp (newest first)
      snapshots.sort((a: HistoricalSnapshot, b: HistoricalSnapshot) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return snapshots;
    }
  } catch (error) {
    console.error('[Historical Tracking] Failed to load snapshots:', error);
  }
  return [];
}

/**
 * Get the most recent snapshot
 */
export function getLatestSnapshot(): HistoricalSnapshot | null {
  const snapshots = loadAllSnapshots();
  return snapshots.length > 0 ? snapshots[0] : null;
}

/**
 * Get the previous snapshot (before latest)
 */
export function getPreviousSnapshot(): HistoricalSnapshot | null {
  const snapshots = loadAllSnapshots();
  return snapshots.length > 1 ? snapshots[1] : null;
}

/**
 * Get snapshots for a specific date range
 */
export function getSnapshotsInRange(startDate: Date, endDate: Date): HistoricalSnapshot[] {
  const snapshots = loadAllSnapshots();
  return snapshots.filter(s => {
    const snapshotDate = new Date(s.timestamp);
    return snapshotDate >= startDate && snapshotDate <= endDate;
  });
}

/**
 * Get snapshots for the last N weeks
 */
export function getLastNWeeks(n: number): HistoricalSnapshot[] {
  const snapshots = loadAllSnapshots();
  return snapshots.slice(0, n);
}

/**
 * Compare current metrics with previous snapshot
 */
export interface ComparisonResult {
  overallVisibility: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
  totalMentions: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
  avgSentiment: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
  competitorRank: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'stable' };
  hasComparison: boolean;
}

export function compareWithPrevious(currentResults: QueryResult[]): ComparisonResult {
  const currentSnapshot = createSnapshot(currentResults);
  const previousSnapshot = getPreviousSnapshot();

  if (!previousSnapshot) {
    return {
      overallVisibility: { current: currentSnapshot.metrics.overallVisibility, previous: 0, change: 0, trend: 'stable' },
      totalMentions: { current: currentSnapshot.metrics.totalMentions, previous: 0, change: 0, trend: 'stable' },
      avgSentiment: { current: currentSnapshot.metrics.avgSentiment, previous: 0, change: 0, trend: 'stable' },
      competitorRank: { current: currentSnapshot.metrics.competitorRank, previous: 0, change: 0, trend: 'stable' },
      hasComparison: false,
    };
  }

  const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  return {
    overallVisibility: {
      current: currentSnapshot.metrics.overallVisibility,
      previous: previousSnapshot.metrics.overallVisibility,
      change: currentSnapshot.metrics.overallVisibility - previousSnapshot.metrics.overallVisibility,
      trend: calculateTrend(currentSnapshot.metrics.overallVisibility, previousSnapshot.metrics.overallVisibility),
    },
    totalMentions: {
      current: currentSnapshot.metrics.totalMentions,
      previous: previousSnapshot.metrics.totalMentions,
      change: currentSnapshot.metrics.totalMentions - previousSnapshot.metrics.totalMentions,
      trend: calculateTrend(currentSnapshot.metrics.totalMentions, previousSnapshot.metrics.totalMentions),
    },
    avgSentiment: {
      current: currentSnapshot.metrics.avgSentiment,
      previous: previousSnapshot.metrics.avgSentiment,
      change: currentSnapshot.metrics.avgSentiment - previousSnapshot.metrics.avgSentiment,
      trend: calculateTrend(currentSnapshot.metrics.avgSentiment, previousSnapshot.metrics.avgSentiment),
    },
    competitorRank: {
      current: currentSnapshot.metrics.competitorRank,
      previous: previousSnapshot.metrics.competitorRank,
      change: currentSnapshot.metrics.competitorRank - previousSnapshot.metrics.competitorRank,
      trend: calculateTrend(previousSnapshot.metrics.competitorRank, currentSnapshot.metrics.competitorRank), // Inverted (lower rank = better)
    },
    hasComparison: true,
  };
}

/**
 * Get trend data for charts (last N weeks)
 */
export function getTrendData(weeks: number = 12) {
  const snapshots = getLastNWeeks(weeks);
  
  return {
    dates: snapshots.map(s => s.date),
    visibility: snapshots.map(s => s.metrics.overallVisibility),
    mentions: snapshots.map(s => s.metrics.totalMentions),
    sentiment: snapshots.map(s => s.metrics.avgSentiment),
    rank: snapshots.map(s => s.metrics.competitorRank),
    platformVisibility: {
      ChatGPT: snapshots.map(s => s.platformMetrics.find(p => p.platform === 'ChatGPT')?.visibility || 0),
      Claude: snapshots.map(s => s.platformMetrics.find(p => p.platform === 'Claude')?.visibility || 0),
      Perplexity: snapshots.map(s => s.platformMetrics.find(p => p.platform === 'Perplexity')?.visibility || 0),
      Gemini: snapshots.map(s => s.platformMetrics.find(p => p.platform === 'Gemini')?.visibility || 0),
    },
  };
}

/**
 * Clear all historical data
 */
export function clearHistoricalData(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[Historical Tracking] Cleared all historical snapshots');
}
