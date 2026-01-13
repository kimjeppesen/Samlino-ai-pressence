import { PlatformCard } from '@/components/dashboard/PlatformCard';
import { VisibilityChart } from '@/components/dashboard/VisibilityChart';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { useQueryData } from '@/hooks/useQueryData';
import { getPlatformData } from '@/lib/services/metricsCalculator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function Platforms() {
  const { queryResults } = useQueryData();
  const platformData = getPlatformData(queryResults);
  const hasData = queryResults.length > 0;
  
  const platformBarData = platformData.map((p) => ({
    name: p.name,
    visibility: p.visibility,
    mentions: p.mentions,
    sentiment: p.sentiment,
    color: p.color,
  }));
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">AI Platforms</h1>
          <p className="page-description">
            Deep dive into your visibility on each AI platform
          </p>
        </div>
        <FilterBar showPlatformFilter={false} />
      </div>

      {!hasData && (
        <div className="kpi-card text-center py-12">
          <p className="text-lg font-semibold text-foreground mb-2">No Platform Data Yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Process queries to see platform-specific metrics
          </p>
          <p className="text-xs text-muted-foreground">
            Go to <strong>Prompts & Queries</strong> page to upload and process queries
          </p>
        </div>
      )}

      {hasData && (
        <>
      {/* Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformData.map((platform, index) => (
          <PlatformCard
            key={platform.id}
            {...platform}
            className={`animate-fade-in stagger-${index + 1}`}
          />
        ))}
      </div>

      {/* Visibility Comparison Chart */}
      <div className="chart-container">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Visibility by Platform</h3>
          <p className="text-sm text-muted-foreground">Current visibility scores comparison</p>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="visibility" radius={[0, 4, 4, 0]}>
                {platformBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <VisibilityChart />

      {/* Sentiment by Platform */}
      <div className="chart-container">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Sentiment by Platform</h3>
          <p className="text-sm text-muted-foreground">How positively your brand is mentioned</p>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sentiment" radius={[4, 4, 0, 0]} fill="hsl(var(--success))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
