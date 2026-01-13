import { useEffect, useState, useMemo } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { PlatformCard } from '@/components/dashboard/PlatformCard';
import { VisibilityChart } from '@/components/dashboard/VisibilityChart';
import { MentionsChart } from '@/components/dashboard/MentionsChart';
import { QueryTable } from '@/components/dashboard/QueryTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { CrawlSelector } from '@/components/dashboard/CrawlSelector';
import { Badge } from '@/components/ui/badge';
import { useQueryData } from '@/hooks/useQueryData';
import { getKPIData, getPlatformData } from '@/lib/services/metricsCalculator';
import { loadQueries, type StoredQuery } from '@/lib/services/queryStorage';
import { getAllCompetitorMetrics } from '@/lib/services/competitorTracking';
import type { QueryResult } from '@/lib/types';

export default function Overview() {
  const [selectedCrawlId, setSelectedCrawlId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const { queryResults, refreshData } = useQueryData(selectedCrawlId);
  
  // Load stored queries to match with results for category/intent filtering
  const [storedQueries, setStoredQueries] = useState<StoredQuery[]>([]);
  
  useEffect(() => {
    setStoredQueries(loadQueries());
    
    const handleUpdate = () => {
      setStoredQueries(loadQueries());
    };
    
    window.addEventListener('queriesUpdated', handleUpdate);
    return () => window.removeEventListener('queriesUpdated', handleUpdate);
  }, []);
  
  // Create a map of query text to category/intent for quick lookup
  const queryMetadataMap = useMemo(() => {
    const map = new Map<string, { category?: string; intent?: string }>();
    storedQueries.forEach(q => {
      map.set(q.query.toLowerCase().trim(), {
        category: q.category,
        intent: q.intent,
      });
    });
    return map;
  }, [storedQueries]);
  
  // Filter results by category and intent
  const filteredResults = useMemo(() => {
    if (!selectedCategory && !selectedIntent) {
      return queryResults;
    }
    
    return queryResults.filter(result => {
      const metadata = queryMetadataMap.get(result.query.toLowerCase().trim());
      if (!metadata) return false;
      
      if (selectedCategory && metadata.category !== selectedCategory) {
        return false;
      }
      if (selectedIntent && metadata.intent !== selectedIntent) {
        return false;
      }
      
      return true;
    });
  }, [queryResults, selectedCategory, selectedIntent, queryMetadataMap]);
  
  const kpiData = getKPIData(filteredResults);
  const platformData = getPlatformData(filteredResults);
  
  // Calculate competitor mentions from filtered results
  const competitorSummary = useMemo(() => {
    const competitorCounts = new Map<string, number>();
    filteredResults.forEach(result => {
      if (result.competitorMentions) {
        result.competitorMentions.forEach(competitor => {
          competitorCounts.set(competitor, (competitorCounts.get(competitor) || 0) + 1);
        });
      }
    });
    return Array.from(competitorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredResults]);

  // Listen for data updates
  useEffect(() => {
    const handleUpdate = () => {
      refreshData();
    };
    window.addEventListener('queryDataUpdated', handleUpdate);
    return () => window.removeEventListener('queryDataUpdated', handleUpdate);
  }, [refreshData]);
  const hasData = queryResults.length > 0;
  const hasFilteredData = filteredResults.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="page-header mb-0">
            <h1 className="page-title">Overview</h1>
            <p className="page-description">
              Monitor your brand's visibility across AI platforms
            </p>
          </div>
          <FilterBar 
            selectedCategory={selectedCategory || undefined}
            selectedIntent={selectedIntent || undefined}
            onCategoryChange={setSelectedCategory}
            onIntentChange={setSelectedIntent}
          />
        </div>
        <CrawlSelector 
          selectedCrawlId={selectedCrawlId} 
          onCrawlChange={setSelectedCrawlId} 
        />
      </div>

      {!hasData && (
        <div className="kpi-card text-center py-12">
          <p className="text-lg font-semibold text-foreground mb-2">No Data Yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Process queries to see your brand visibility metrics
          </p>
          <p className="text-xs text-muted-foreground">
            Go to <strong>Prompts & Queries</strong> page to upload and process queries
          </p>
        </div>
      )}

      {hasData && (
        <>
      {/* Filter Status */}
      {(selectedCategory || selectedIntent) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {filteredResults.length} of {queryResults.length} results</span>
          {(selectedCategory || selectedIntent) && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedIntent(null);
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      
      {!hasFilteredData && (selectedCategory || selectedIntent) && (
        <div className="kpi-card text-center py-8">
          <p className="text-muted-foreground">No results match the selected filters</p>
        </div>
      )}
      
      {hasFilteredData && (
        <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={kpiData.overallVisibility.label}
          value={kpiData.overallVisibility.value}
          change={kpiData.overallVisibility.change}
          trend={kpiData.overallVisibility.trend}
          description={kpiData.overallVisibility.description}
          suffix="/100"
          className="animate-fade-in stagger-1"
        />
        <KPICard
          label={kpiData.totalMentions.label}
          value={kpiData.totalMentions.value}
          change={kpiData.totalMentions.change}
          trend={kpiData.totalMentions.trend}
          description={kpiData.totalMentions.description}
          className="animate-fade-in stagger-2"
        />
        <KPICard
          label={kpiData.avgSentiment.label}
          value={kpiData.avgSentiment.value}
          change={kpiData.avgSentiment.change}
          trend={kpiData.avgSentiment.trend}
          description={kpiData.avgSentiment.description}
          suffix="%"
          className="animate-fade-in stagger-3"
        />
        <KPICard
          label={kpiData.competitorRank.label}
          value={`#${kpiData.competitorRank.value}`}
          change={kpiData.competitorRank.change}
          trend={kpiData.competitorRank.trend}
          description={kpiData.competitorRank.description}
          className="animate-fade-in stagger-4"
        />
      </div>

      {/* Platform Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Platform Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformData.map((platform, index) => (
            <PlatformCard
              key={platform.id}
              {...platform}
              className={`animate-fade-in stagger-${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisibilityChart />
        <MentionsChart />
      </div>

      {/* Competitor Mentions Summary */}
      {competitorSummary.length > 0 && (
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Competitor Mentions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {competitorSummary.map((comp) => (
              <div
                key={comp.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
              >
                <span className="font-medium text-foreground">{comp.name}</span>
                <Badge variant="secondary">{comp.count} mention{comp.count !== 1 ? 's' : ''}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Queries */}
      <QueryTable limit={5} data={filteredResults} />
        </>
      )}
        </>
      )}
    </div>
  );
}
