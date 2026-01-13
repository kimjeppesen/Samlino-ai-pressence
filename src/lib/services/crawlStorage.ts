// Service for storing crawls with unique IDs (database-like approach using localStorage)

import type { QueryResult } from '../types';

export interface CrawlData {
  crawlId: string;
  timestamp: string; // ISO timestamp
  date: string; // YYYY-MM-DD
  results: QueryResult[];
  metadata: {
    totalQueries: number;
    platforms: string[];
    queryCount: number;
  };
}

const STORAGE_KEY = 'ai-visibility-crawls';
const MAX_CRAWLS = 1000; // Keep up to 1000 crawls

/**
 * Generate a unique crawl ID
 */
function generateCrawlId(): string {
  return `crawl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save a new crawl (appends, never overwrites)
 */
export function saveCrawl(results: QueryResult[]): string {
  try {
    if (!results || results.length === 0) {
      console.warn('[Crawl Storage] No results to save');
      return '';
    }

    const crawlId = generateCrawlId();
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    // Get unique platforms from results
    const platforms = [...new Set(results.map(r => r.platform))];

    const crawl: CrawlData = {
      crawlId,
      timestamp,
      date,
      results,
      metadata: {
        totalQueries: results.length,
        platforms,
        queryCount: results.length,
      },
    };

    // Load existing crawls
    const existingCrawls = loadAllCrawls();
    
    // Append new crawl (never overwrite)
    const allCrawls = [...existingCrawls, crawl];
    
    // Sort by timestamp (newest first)
    allCrawls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Keep only last MAX_CRAWLS
    const trimmed = allCrawls.slice(0, MAX_CRAWLS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    console.log(`[Crawl Storage] Saved crawl ${crawlId} with ${results.length} results. Total crawls: ${trimmed.length}`);
    
    return crawlId;
  } catch (error) {
    console.error('[Crawl Storage] Failed to save crawl:', error);
    throw error;
  }
}

/**
 * Load all crawls
 */
export function loadAllCrawls(): CrawlData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const crawls = JSON.parse(stored);
      // Sort by timestamp (newest first)
      crawls.sort((a: CrawlData, b: CrawlData) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return crawls;
    }
  } catch (error) {
    console.error('[Crawl Storage] Failed to load crawls:', error);
  }
  return [];
}

/**
 * Get a specific crawl by ID
 */
export function getCrawlById(crawlId: string): CrawlData | null {
  const crawls = loadAllCrawls();
  return crawls.find(c => c.crawlId === crawlId) || null;
}

/**
 * Get the latest crawl
 */
export function getLatestCrawl(): CrawlData | null {
  const crawls = loadAllCrawls();
  return crawls.length > 0 ? crawls[0] : null;
}

/**
 * Get all results from all crawls (for current view)
 */
export function getAllResults(): QueryResult[] {
  const crawls = loadAllCrawls();
  // Flatten all results from all crawls
  return crawls.flatMap(crawl => crawl.results);
}

/**
 * Get results from a specific crawl
 */
export function getCrawlResults(crawlId: string): QueryResult[] {
  const crawl = getCrawlById(crawlId);
  return crawl ? crawl.results : [];
}

/**
 * Get crawls in a date range
 */
export function getCrawlsInRange(startDate: Date, endDate: Date): CrawlData[] {
  const crawls = loadAllCrawls();
  return crawls.filter(crawl => {
    const crawlDate = new Date(crawl.timestamp);
    return crawlDate >= startDate && crawlDate <= endDate;
  });
}

/**
 * Get crawls for last N days
 */
export function getCrawlsLastNDays(days: number): CrawlData[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return getCrawlsInRange(startDate, endDate);
}

/**
 * Delete a specific crawl
 */
export function deleteCrawl(crawlId: string): boolean {
  try {
    const crawls = loadAllCrawls();
    const filtered = crawls.filter(c => c.crawlId !== crawlId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log(`[Crawl Storage] Deleted crawl ${crawlId}`);
    return true;
  } catch (error) {
    console.error('[Crawl Storage] Failed to delete crawl:', error);
    return false;
  }
}

/**
 * Clear all crawls
 */
export function clearAllCrawls(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[Crawl Storage] Cleared all crawls');
}

/**
 * Get crawl summary (for UI display)
 */
export interface CrawlSummary {
  crawlId: string;
  date: string;
  timestamp: string;
  resultCount: number;
  mentionedCount: number;
  platforms: string[];
}

export function getCrawlSummaries(): CrawlSummary[] {
  const crawls = loadAllCrawls();
  return crawls.map(crawl => ({
    crawlId: crawl.crawlId,
    date: crawl.date,
    timestamp: crawl.timestamp,
    resultCount: crawl.results.length,
    mentionedCount: crawl.results.filter(r => r.mentioned).length,
    platforms: crawl.metadata.platforms,
  }));
}
