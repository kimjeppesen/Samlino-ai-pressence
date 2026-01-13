import { KPICard } from '@/components/dashboard/KPICard';
import { PlatformCard } from '@/components/dashboard/PlatformCard';
import { VisibilityChart } from '@/components/dashboard/VisibilityChart';
import { MentionsChart } from '@/components/dashboard/MentionsChart';
import { QueryTable } from '@/components/dashboard/QueryTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { kpiData, platformData } from '@/lib/mockData';

export default function Overview() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Overview</h1>
          <p className="page-description">
            Monitor your brand's visibility across AI platforms
          </p>
        </div>
        <FilterBar />
      </div>

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

      {/* Recent Queries */}
      <QueryTable limit={5} />
    </div>
  );
}
