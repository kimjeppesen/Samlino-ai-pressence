import { useState, useEffect } from 'react';
import { Check, X, Calendar, Database, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { QueryResult } from '@/lib/types';
import { loadAllCrawls, getCrawlById, type CrawlData, getCrawlSummaries, type CrawlSummary } from '@/lib/services/crawlStorage';

const platformColors: Record<string, string> = {
  ChatGPT: 'bg-chart-1/10 text-chart-1',
  Claude: 'bg-chart-2/10 text-chart-2',
  Perplexity: 'bg-chart-3/10 text-chart-3',
  Gemini: 'bg-chart-4/10 text-chart-4',
};

interface QueryTableProps {
  limit?: number;
  data?: QueryResult[]; // Legacy prop - will be ignored if crawls are available
}

export function QueryTable({ limit, data: propData }: QueryTableProps) {
  const [crawls, setCrawls] = useState<CrawlSummary[]>([]);
  const [selectedCrawlId, setSelectedCrawlId] = useState<string | null>(null);
  const [selectedCrawl, setSelectedCrawl] = useState<CrawlData | null>(null);
  const [displayData, setDisplayData] = useState<QueryResult[]>([]);

  useEffect(() => {
    const summaries = getCrawlSummaries();
    setCrawls(summaries);
    
    // Auto-select latest crawl if available
    if (summaries.length > 0 && !selectedCrawlId) {
      setSelectedCrawlId(summaries[0].crawlId);
    }
    
    // Listen for updates
    const handleUpdate = () => {
      const updated = getCrawlSummaries();
      setCrawls(updated);
      if (updated.length > 0 && !selectedCrawlId) {
        setSelectedCrawlId(updated[0].crawlId);
      }
    };
    
    window.addEventListener('queryDataUpdated', handleUpdate);
    return () => window.removeEventListener('queryDataUpdated', handleUpdate);
  }, [selectedCrawlId]);

  useEffect(() => {
    if (selectedCrawlId) {
      const crawl = getCrawlById(selectedCrawlId);
      if (crawl) {
        setSelectedCrawl(crawl);
        const results = limit ? crawl.results.slice(0, limit) : crawl.results;
        setDisplayData(results);
      } else {
        setSelectedCrawl(null);
        setDisplayData([]);
      }
    } else if (propData && propData.length > 0) {
      // Fallback to legacy prop data if no crawls
      const results = limit ? propData.slice(0, limit) : propData;
      setDisplayData(results);
    } else {
      setDisplayData([]);
    }
  }, [selectedCrawlId, propData, limit]);
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  if (crawls.length === 0 && displayData.length === 0) {
    return (
      <div className="data-table">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Query Results</h3>
          <p className="text-sm text-muted-foreground">Processed queries and their results</p>
        </div>
        <div className="p-12 text-center">
          <p className="text-muted-foreground mb-2">No query results yet</p>
          <p className="text-sm text-muted-foreground">
            Process queries to see results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Query Results by Crawl</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCrawl 
                ? `Results from crawl on ${formatDateShort(selectedCrawl.timestamp)}`
                : 'Select a crawl to view its results'}
            </p>
          </div>
          {crawls.length > 0 && (
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <Select
                value={selectedCrawlId || ''}
                onValueChange={(value) => setSelectedCrawlId(value)}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a crawl">
                    {selectedCrawl 
                      ? `${formatDateShort(selectedCrawl.timestamp)} - ${selectedCrawl.results.length} results`
                      : 'Select a crawl'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {crawls.map((crawl) => (
                    <SelectItem key={crawl.crawlId} value={crawl.crawlId}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{formatDate(crawl.timestamp)}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {crawl.resultCount} results
                        </Badge>
                        {crawl.mentionedCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {crawl.mentionedCount} mentions
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Query</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Platform</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Mentioned</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Position</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Competitors</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">URLs</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No results in this crawl
                </td>
              </tr>
            ) : (
              displayData.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <p className="font-medium text-foreground">{row.query}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {row.context}
                  </p>
                </td>
                <td className="p-4">
                  <span className={cn('platform-badge', platformColors[row.platform])}>
                    {row.platform}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {row.mentioned ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                      <Check className="w-4 h-4 text-success" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10">
                      <X className="w-4 h-4 text-destructive" />
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {row.position ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                      #{row.position}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-4">
                  {row.competitorMentions && row.competitorMentions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {row.competitorMentions.map((competitor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {competitor}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                <td className="p-4">
                  {row.urls && row.urls.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {row.urls.slice(0, 3).map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                          title={url}
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                        </a>
                      ))}
                      {row.urls.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{row.urls.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{row.date}</td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
