import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQueryData } from '@/hooks/useQueryData';
import { getCrawlsInRange } from '@/lib/services/crawlStorage';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DateRange = 'month' | '3months' | 'year' | 'all';

export function MentionsChart() {
  const { queryResults } = useQueryData();
  const [chartData, setChartData] = useState<Array<{ date: string; mentions: number }>>([]);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  
  useEffect(() => {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2020); // Far back date
        break;
    }
    
    // Get crawls in date range
    const crawls = getCrawlsInRange(startDate, endDate);
    
    // Build chart data from crawls
    const chartDataPoints = crawls.map(crawl => ({
      date: new Date(crawl.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: crawl.timestamp,
      mentions: crawl.results.filter(r => r.mentioned).length,
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // If no crawls but we have current results, add current data point
    if (chartDataPoints.length === 0 && queryResults.length > 0) {
      const currentMentions = queryResults.filter(r => r.mentioned).length;
      chartDataPoints.push({
        date: 'Current',
        timestamp: new Date().toISOString(),
        mentions: currentMentions,
      });
    }
    
    if (chartDataPoints.length === 0) {
      chartDataPoints.push({ date: 'No data', timestamp: new Date().toISOString(), mentions: 0 });
    }
    
    setChartData(chartDataPoints);
  }, [queryResults, dateRange]);

  return (
    <div className="chart-container">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Mention Volume Trends</h3>
          <p className="text-sm text-muted-foreground">
            {chartData.length > 1 ? `Historical mention trends (${chartData.length} crawls)` : 'Mentions by date from processed queries'}
          </p>
        </div>
        <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="mentionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px -4px hsl(var(--foreground) / 0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="mentions"
              name="Mentions"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#mentionsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
