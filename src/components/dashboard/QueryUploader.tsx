// Component for uploading query files and processing them

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { readQueryFile } from '@/lib/services/fileReader';
import { useQueryProcessor } from '@/hooks/useQueryProcessor';
import { clearStoredData } from '@/lib/services/dataStorage';
import type { Query } from '@/lib/types';

interface QueryUploaderProps {
  onQueriesProcessed?: (results: any[]) => void;
}

export function QueryUploader({ onQueriesProcessed }: QueryUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const { processQueries, isProcessing, progress, error } = useQueryProcessor();

  const handleClearData = useCallback(() => {
    if (confirm('Are you sure you want to clear all stored query data? This cannot be undone.')) {
      clearStoredData();
      if (onQueriesProcessed) {
        onQueriesProcessed([]);
      }
      window.dispatchEvent(new Event('queryDataUpdated'));
      window.location.reload(); // Force full refresh
    }
  }, [onQueriesProcessed]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileError(null);

    try {
      const result = await readQueryFile(selectedFile);
      // Parse queries without date (date will be set during processing)
      const parsedQueries: Query[] = result.queries.map((q, index) => ({
        id: q.id || `query-${index + 1}`,
        query: q.query,
        // No date - will be set to crawl date during processing
      }));

      setQueries(parsedQueries);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to read file');
      setFile(null);
      setQueries([]);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (queries.length === 0) return;

    console.log('[QueryUploader] Starting to process', queries.length, 'queries');
    
    // Check API keys before processing - reload config to get latest
    const { loadConfigFromStorage, getConfig } = await import('@/lib/config');
    loadConfigFromStorage();
    const config = getConfig();
    
    const hasAnthropic = !!(config.api.anthropic?.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY);
    const hasOpenAI = !!(config.api.openai?.apiKey || import.meta.env.VITE_OPENAI_API_KEY);
    const hasPerplexity = !!(config.api.perplexity?.apiKey || import.meta.env.VITE_PERPLEXITY_API_KEY);
    const hasGoogle = !!(config.api.google?.apiKey || import.meta.env.VITE_GOOGLE_API_KEY);
    
    console.log('[QueryUploader] API key check:', {
      Anthropic: hasAnthropic ? 'Found' : 'Missing',
      OpenAI: hasOpenAI ? 'Found' : 'Missing',
      Perplexity: hasPerplexity ? 'Found' : 'Missing',
      Google: hasGoogle ? 'Found' : 'Missing',
    });
    
    const hasAnyApiKey = hasAnthropic || hasOpenAI || hasPerplexity || hasGoogle;
    
    if (!hasAnyApiKey) {
      const errorMsg = 'No API keys configured. Please go to Settings and enter at least one API key (Claude, ChatGPT, Perplexity, or Gemini) before processing queries.';
      console.error('[QueryUploader]', errorMsg);
      setFileError(errorMsg);
      return;
    }
    
    setFileError(null); // Clear any previous errors
    
    try {
      await processQueries(queries, { batchSize: 3 });
      console.log('[QueryUploader] Processing completed, waiting for storage...');
      
      // Wait a bit for storage to be updated
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onQueriesProcessed) {
        // Load results after processing
        const { loadQueryResults } = await import('@/lib/services/dataStorage');
        const results = loadQueryResults();
        console.log('[QueryUploader] Loaded', results.length, 'results from storage');
        onQueriesProcessed(results);
      }
      
      // Trigger custom event to update all components
      window.dispatchEvent(new Event('queryDataUpdated'));
      console.log('[QueryUploader] Triggered queryDataUpdated event');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[QueryUploader] Failed to process queries:', errorMessage);
      console.error('[QueryUploader] Full error:', err);
      // Set error state to show in UI
      setFileError(`Processing failed: ${errorMessage}`);
    }
  }, [queries, processQueries, onQueriesProcessed]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upload Queries</CardTitle>
            <CardDescription>
              Upload a CSV or text file containing queries to check for brand presence
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
          </label>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{file.name}</span>
              <span className="text-xs">({queries.length} queries)</span>
            </div>
          )}
        </div>

        {fileError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        )}

        {queries.length > 0 && !isProcessing && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {queries.length} queries. Ready to process.
            </p>
            <Button onClick={handleProcess} className="w-full">
              Process Queries
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing queries...</span>
              <span className="font-medium">
                {progress.current} / {progress.total}
              </span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isProcessing && progress.current > 0 && progress.current === progress.total && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Processing Complete</AlertTitle>
            <AlertDescription>
              Successfully processed {progress.total} queries
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
