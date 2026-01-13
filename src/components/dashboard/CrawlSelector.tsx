import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCrawlSummaries, type CrawlSummary } from '@/lib/services/crawlStorage';
import { Calendar } from 'lucide-react';

interface CrawlSelectorProps {
  selectedCrawlId: string | null;
  onCrawlChange: (crawlId: string | null) => void;
}

export function CrawlSelector({ selectedCrawlId, onCrawlChange }: CrawlSelectorProps) {
  const [crawls, setCrawls] = useState<CrawlSummary[]>([]);

  useEffect(() => {
    const summaries = getCrawlSummaries();
    setCrawls(summaries);
    
    // Listen for updates
    const handleUpdate = () => {
      setCrawls(getCrawlSummaries());
    };
    window.addEventListener('queryDataUpdated', handleUpdate);
    return () => window.removeEventListener('queryDataUpdated', handleUpdate);
  }, []);

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

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Select
        value={selectedCrawlId || 'all'}
        onValueChange={(value) => onCrawlChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select crawl" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Crawls (Combined)</SelectItem>
          {crawls.map((crawl) => (
            <SelectItem key={crawl.crawlId} value={crawl.crawlId}>
              {formatDate(crawl.timestamp)} - {crawl.resultCount} results ({crawl.mentionedCount} mentions)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {crawls.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {crawls.length} crawl{crawls.length !== 1 ? 's' : ''} total
        </span>
      )}
    </div>
  );
}
