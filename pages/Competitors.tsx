import { CompetitorChart } from '@/components/dashboard/CompetitorChart';
import { CompetitorTable } from '@/components/dashboard/CompetitorTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { KPICard } from '@/components/dashboard/KPICard';
import { competitorData } from '@/lib/mockData';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const yourBrand = competitorData.find((c) => c.isUser)!;
const topCompetitor = competitorData.find((c) => !c.isUser && c.visibility > yourBrand.visibility);

const radarData = [
  { subject: 'Visibility', yourBrand: yourBrand.visibility, competitor: topCompetitor?.visibility || 0 },
  { subject: 'Mentions', yourBrand: (yourBrand.mentions / 40), competitor: (topCompetitor?.mentions || 0) / 40 },
  { subject: 'Sentiment', yourBrand: yourBrand.sentiment, competitor: topCompetitor?.sentiment || 0 },
  { subject: 'Growth', yourBrand: Math.min(yourBrand.growth * 5 + 50, 100), competitor: Math.min((topCompetitor?.growth || 0) * 5 + 50, 100) },
];

export default function Competitors() {
  const yourRank = competitorData.sort((a, b) => b.visibility - a.visibility).findIndex((c) => c.isUser) + 1;
  const gap = topCompetitor ? topCompetitor.visibility - yourBrand.visibility : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Competitor Comparison</h1>
          <p className="page-description">
            See how your brand stacks up against the competition
          </p>
        </div>
        <FilterBar showPlatformFilter={false} />
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Your Ranking"
          value={`#${yourRank}`}
          change={1}
          trend="up"
          description="In your industry category"
          className="animate-fade-in stagger-1"
        />
        <KPICard
          label="Gap to Leader"
          value={gap}
          change={-2}
          trend="up"
          description="Visibility points behind #1"
          suffix="pts"
          className="animate-fade-in stagger-2"
        />
        <KPICard
          label="Your Growth Rate"
          value={yourBrand.growth}
          change={3.1}
          trend="up"
          description="vs. industry avg of 5.2%"
          suffix="%"
          className="animate-fade-in stagger-3"
        />
        <KPICard
          label="Competitors Tracked"
          value={competitorData.length - 1}
          change={0}
          trend="up"
          description="Active monitoring"
          className="animate-fade-in stagger-4"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <CompetitorChart />

        {/* Radar Chart */}
        <div className="chart-container">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Competitive Analysis</h3>
            <p className="text-sm text-muted-foreground">Your brand vs top competitor</p>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Radar
                  name="Your Brand"
                  dataKey="yourBrand"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Competitor A"
                  dataKey="competitor"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Competitor Table */}
      <CompetitorTable />
    </div>
  );
}
