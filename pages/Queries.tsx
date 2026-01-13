import { QueryTable } from '@/components/dashboard/QueryTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { KPICard } from '@/components/dashboard/KPICard';
import { queryData } from '@/lib/mockData';

export default function Queries() {
  const mentionedCount = queryData.filter((q) => q.mentioned).length;
  const avgPosition = queryData
    .filter((q) => q.position)
    .reduce((acc, q) => acc + (q.position || 0), 0) / queryData.filter((q) => q.position).length;
  const positiveCount = queryData.filter((q) => q.sentiment === 'positive').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Prompts & Queries</h1>
          <p className="page-description">
            Track how your brand appears in AI-generated responses
          </p>
        </div>
        <FilterBar />
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Mention Rate"
          value={Math.round((mentionedCount / queryData.length) * 100)}
          change={5.2}
          trend="up"
          description={`${mentionedCount} of ${queryData.length} monitored queries`}
          suffix="%"
          className="animate-fade-in stagger-1"
        />
        <KPICard
          label="Average Position"
          value={avgPosition.toFixed(1)}
          change={0.3}
          trend="up"
          description="When mentioned in responses"
          suffix=""
          className="animate-fade-in stagger-2"
        />
        <KPICard
          label="Positive Mentions"
          value={Math.round((positiveCount / mentionedCount) * 100)}
          change={2.1}
          trend="up"
          description={`${positiveCount} positive out of ${mentionedCount} mentions`}
          suffix="%"
          className="animate-fade-in stagger-3"
        />
      </div>

      {/* Query Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card">
          <h3 className="font-semibold text-foreground mb-4">Top Performing Queries</h3>
          <div className="space-y-3">
            {queryData
              .filter((q) => q.position && q.position <= 2)
              .slice(0, 3)
              .map((query) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20"
                >
                  <span className="text-sm font-medium text-foreground line-clamp-1 flex-1 mr-2">
                    {query.query}
                  </span>
                  <span className="text-sm font-semibold text-success">#{query.position}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="kpi-card">
          <h3 className="font-semibold text-foreground mb-4">Needs Improvement</h3>
          <div className="space-y-3">
            {queryData
              .filter((q) => q.position && q.position >= 4)
              .slice(0, 3)
              .map((query) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <span className="text-sm font-medium text-foreground line-clamp-1 flex-1 mr-2">
                    {query.query}
                  </span>
                  <span className="text-sm font-semibold text-warning">#{query.position}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="kpi-card">
          <h3 className="font-semibold text-foreground mb-4">Missing Mentions</h3>
          <div className="space-y-3">
            {queryData
              .filter((q) => !q.mentioned)
              .slice(0, 3)
              .map((query) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <span className="text-sm font-medium text-foreground line-clamp-1 flex-1 mr-2">
                    {query.query}
                  </span>
                  <span className="text-sm font-semibold text-destructive">Not found</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Full Query Table */}
      <QueryTable />
    </div>
  );
}
