import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useQueryData } from '@/hooks/useQueryData';
import { calculatePlatformMetrics } from '@/lib/services/metricsCalculator';
import { getCrawlsInRange, getCrawlResults } from '@/lib/services/crawlStorage';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DateRange = 'month' | '3months' | 'year' | 'all';

export function VisibilityChart() {
  const { queryResults } = useQueryData();
  const [chartData, setChartData] = useState<Array<Record<string, any>>>([]);
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
    const chartDataPoints = crawls.map(crawl => {
      const crawlResults = crawl.results;
      return {
        date: new Date(crawl.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: crawl.timestamp,
        chatgpt: calculatePlatformMetrics(crawlResults, 'ChatGPT').visibility,
        claude: calculatePlatformMetrics(crawlResults, 'Claude').visibility,
        perplexity: calculatePlatformMetrics(crawlResults, 'Perplexity').visibility,
        gemini: calculatePlatformMetrics(crawlResults, 'Gemini').visibility,
      };
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // If no crawls but we have current results, add current data point
    if (chartDataPoints.length === 0 && queryResults.length > 0) {
      chartDataPoints.push({
        date: 'Current',
        timestamp: new Date().toISOString(),
        chatgpt: calculatePlatformMetrics(queryResults, 'ChatGPT').visibility,
        claude: calculatePlatformMetrics(queryResults, 'Claude').visibility,
        perplexity: calculatePlatformMetrics(queryResults, 'Perplexity').visibility,
        gemini: calculatePlatformMetrics(queryResults, 'Gemini').visibility,
      });
    }
    
    setChartData(chartDataPoints);
  }, [queryResults, dateRange]);

  return (
    <div className="chart-container">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Visibility Trends</h3>
          <p className="text-sm text-muted-foreground">
            {chartData.length > 1 ? `Historical visibility trends (${chartData.length} crawls)` : 'Current visibility scores across AI platforms'}
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={[0, 100]}
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
            <Legend />
            <Line
              type="monotone"
              dataKey="chatgpt"
              name="ChatGPT"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="claude"
              name="Claude"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="perplexity"
              name="Perplexity"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="gemini"
              name="Gemini"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
