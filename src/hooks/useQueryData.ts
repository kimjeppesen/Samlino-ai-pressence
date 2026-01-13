// Hook for managing query data (now uses crawl storage)

import { useState, useEffect, useCallback } from 'react';
import { getAllResults, getCrawlResults, getCrawlSummaries, type CrawlSummary } from '@/lib/services/crawlStorage';
import type { QueryResult } from '@/lib/types';

export function useQueryData(selectedCrawlId?: string | null) {
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawlSummaries, setCrawlSummaries] = useState<CrawlSummary[]>([]);

  const refreshData = useCallback(() => {
    try {
      setLoading(true);
      
      // Load crawl summaries
      const summaries = getCrawlSummaries();
      setCrawlSummaries(summaries);
      
      // Load results based on selection
      if (selectedCrawlId) {
        const results = getCrawlResults(selectedCrawlId);
        console.log(`[useQueryData] Loaded results from crawl ${selectedCrawlId}:`, results.length);
        setQueryResults(results);
      } else {
        // Load all results from all crawls
        const results = getAllResults();
        console.log('[useQueryData] Loaded all results:', results.length);
        setQueryResults(results);
      }
    } catch (error) {
      console.error('[useQueryData] Error loading data:', error);
      setQueryResults([]);
      setCrawlSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCrawlId]);

  useEffect(() => {
    refreshData();

    // Listen for data updates
    const handleUpdate = () => {
      console.log('[useQueryData] Data updated event received');
      refreshData();
    };
    window.addEventListener('queryDataUpdated', handleUpdate);
    return () => window.removeEventListener('queryDataUpdated', handleUpdate);
  }, [refreshData]);

  return { queryResults, loading, refreshData, crawlSummaries };
}
