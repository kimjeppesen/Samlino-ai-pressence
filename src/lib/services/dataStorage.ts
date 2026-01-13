// Service for storing and retrieving processed query data

import type { QueryResult, ProcessedQuery } from '../types';
import { saveCrawl, clearAllCrawls } from './crawlStorage';

const STORAGE_KEY = 'ai-visibility-query-results';
const STORAGE_KEY_PROCESSED = 'ai-visibility-processed-queries';

/**
 * Save query results to localStorage (legacy - now uses crawl storage)
 * This function now saves as a new crawl instead of overwriting
 */
export function saveQueryResults(results: QueryResult[]): void {
  try {
    if (!results || results.length === 0) {
      console.warn('No results to save');
      return;
    }
    
    // Use new crawl storage system (appends, never overwrites)
    const crawlId = saveCrawl(results);
    console.log(`[Data Storage] Saved results as crawl ${crawlId}`);
    
    // Also maintain legacy storage for backward compatibility
    const existing = loadQueryResults();
    const combined = [...existing, ...results];
    
    // Remove duplicates based on id
    const unique = Array.from(
      new Map(combined.map(item => [item.id, item])).values()
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    
    // Trigger storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(unique),
    }));
    
    // Also trigger custom event
    window.dispatchEvent(new Event('queryDataUpdated'));
  } catch (error) {
    console.error('Failed to save query results:', error);
    throw error;
  }
}

/**
 * Load query results from localStorage
 */
export function loadQueryResults(): QueryResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const results = JSON.parse(stored);
      console.log(`Loaded ${results.length} query results from localStorage`);
      return results;
    }
  } catch (error) {
    console.error('Failed to load query results:', error);
  }
  console.log('No query results found in localStorage');
  return [];
}

/**
 * Save processed queries
 */
export function saveProcessedQueries(queries: ProcessedQuery[]): void {
  try {
    const existing = loadProcessedQueries();
    const combined = [...existing, ...queries];
    
    // Remove duplicates based on id
    const unique = Array.from(
      new Map(combined.map(item => [item.id, item])).values()
    );
    
    localStorage.setItem(STORAGE_KEY_PROCESSED, JSON.stringify(unique));
  } catch (error) {
    console.error('Failed to save processed queries:', error);
    throw error;
  }
}

/**
 * Load processed queries
 */
export function loadProcessedQueries(): ProcessedQuery[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PROCESSED);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load processed queries:', error);
  }
  return [];
}

/**
 * Clear all stored data (including historical snapshots and crawls)
 */
export function clearStoredData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY_PROCESSED);
  // Clear crawl storage
  try {
    clearAllCrawls();
  } catch (error) {
    console.error('Failed to clear crawls:', error);
    localStorage.removeItem('ai-visibility-crawls');
  }
  // Also clear historical snapshots
  try {
    // Dynamic import to avoid circular dependency issues
    import('./historicalTracking').then(({ clearHistoricalData }) => {
      clearHistoricalData();
    }).catch(() => {
      // If historical tracking not available, just remove the key
      localStorage.removeItem('ai-visibility-historical-snapshots');
    });
  } catch (error) {
    // If historical tracking not available, just remove the key
    localStorage.removeItem('ai-visibility-historical-snapshots');
  }
}

/**
 * Export query results as JSON
 */
export function exportQueryResults(results: QueryResult[]): string {
  return JSON.stringify(results, null, 2);
}

/**
 * Export query results as CSV
 */
export function exportQueryResultsAsCSV(results: QueryResult[]): string {
  const headers = ['ID', 'Query', 'Platform', 'Mentioned', 'Position', 'Sentiment', 'Date', 'Context', 'Confidence'];
  const rows = results.map(result => [
    result.id,
    `"${result.query.replace(/"/g, '""')}"`,
    result.platform,
    result.mentioned ? 'Yes' : 'No',
    result.position || '',
    result.sentiment,
    result.date,
    `"${result.context.replace(/"/g, '""')}"`,
    result.confidence || '',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
