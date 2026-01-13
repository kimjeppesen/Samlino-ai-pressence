// React hook for processing queries

import { useState, useCallback } from 'react';
import type { Query, ProcessedQuery, QueryResult, Platform } from '@/lib/types';
import { processQuery, processQueries, processQueryForPlatform } from '@/lib/services/queryProcessor';
import { saveQueryResults, loadQueryResults } from '@/lib/services/dataStorage';

interface UseQueryProcessorReturn {
  results: QueryResult[];
  processedQueries: ProcessedQuery[];
  isProcessing: boolean;
  progress: { current: number; total: number };
  error: string | null;
  processQuery: (query: Query, platforms?: Platform[]) => Promise<ProcessedQuery>;
  processQueries: (queries: Query[], options?: { platforms?: Platform[]; batchSize?: number }) => Promise<void>;
  processQueryForPlatform: (query: Query, platform: Platform) => Promise<QueryResult>;
  loadStoredResults: () => void;
  clearResults: () => void;
}

export function useQueryProcessor(): UseQueryProcessorReturn {
  const [results, setResults] = useState<QueryResult[]>([]);
  const [processedQueries, setProcessedQueries] = useState<ProcessedQuery[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const processSingleQuery = useCallback(async (
    query: Query,
    platforms?: Platform[]
  ): Promise<ProcessedQuery> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const processed = await processQuery(query, { platforms });
      setProcessedQueries(prev => [...prev, processed]);
      
      if (processed.results.length > 0) {
        setResults(prev => [...prev, ...processed.results]);
        saveQueryResults(processed.results);
      }
      
      return processed;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processMultipleQueries = useCallback(async (
    queries: Query[],
    options?: { platforms?: Platform[]; batchSize?: number }
  ): Promise<void> => {
    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: queries.length });
    
    try {
      const processed = await processQueries(queries, {
        ...options,
        onProgress: (current, total) => {
          setProgress({ current, total });
        },
      });
      
      setProcessedQueries(prev => [...prev, ...processed]);
      
      // Extract all results
      const allResults = processed.flatMap(p => p.results);
      console.log(`[useQueryProcessor] Processed ${processed.length} queries, got ${allResults.length} results`);
      
      // Log any queries that failed
      const failedQueries = processed.filter(p => p.status === 'error' || p.results.length === 0);
      if (failedQueries.length > 0) {
        const errorMessages = failedQueries.map(q => q.error || 'No results returned').filter(Boolean);
        const uniqueErrors = [...new Set(errorMessages)];
        console.warn(`[useQueryProcessor] ${failedQueries.length} queries had issues:`, failedQueries.map(q => ({ id: q.id, status: q.status, resultsCount: q.results.length, error: q.error })));
        
        if (uniqueErrors.length > 0 && allResults.length === 0) {
          // Only set error if we got NO results at all
          setError(`Processing completed but no results. Errors: ${uniqueErrors.join('; ')}`);
        }
      }
      
      if (allResults.length > 0) {
        console.log('[useQueryProcessor] Saving results to storage...');
        setResults(prev => {
          const combined = [...prev, ...allResults];
          const unique = Array.from(
            new Map(combined.map(item => [item.id, item])).values()
          );
          console.log(`[useQueryProcessor] Combined ${prev.length} existing + ${allResults.length} new = ${unique.length} unique results`);
          return unique;
        });
        saveQueryResults(allResults);
        console.log('[useQueryProcessor] Results saved successfully');
        
        // Create and save historical snapshot
        const { createSnapshot, saveSnapshot } = await import('@/lib/services/historicalTracking');
        const { loadQueryResults } = await import('@/lib/services/dataStorage');
        const allStoredResults = loadQueryResults();
        const snapshot = createSnapshot(allStoredResults);
        saveSnapshot(snapshot);
        console.log('[useQueryProcessor] Historical snapshot saved for week', snapshot.week);
        
        setError(null); // Clear any previous errors
      } else {
        const errorMsg = 'No results returned from API. Check API key configuration and network connection. See console for details.';
        console.warn('[useQueryProcessor]', errorMsg);
        if (processed.length > 0) {
          console.warn('[useQueryProcessor] Processed queries details:', processed.map(p => ({ 
            id: p.id, 
            query: p.query.substring(0, 50),
            status: p.status, 
            resultsCount: p.results.length, 
            error: p.error 
          })));
        }
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process queries';
      console.error('[useQueryProcessor] Exception caught:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, []);

  const processSinglePlatform = useCallback(async (
    query: Query,
    platform: Platform
  ): Promise<QueryResult> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await processQueryForPlatform(query, platform);
      setResults(prev => [...prev, result]);
      saveQueryResults([result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const loadStoredResults = useCallback(() => {
    const stored = loadQueryResults();
    setResults(stored);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setProcessedQueries([]);
    setProgress({ current: 0, total: 0 });
    setError(null);
  }, []);

  return {
    results,
    processedQueries,
    isProcessing,
    progress,
    error,
    processQuery: processSingleQuery,
    processQueries: processMultipleQueries,
    processQueryForPlatform: processSinglePlatform,
    loadStoredResults,
    clearResults,
  };
}
