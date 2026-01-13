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
import { getAllMetrics, getYourBrandMetrics } from '@/lib/services/competitorTracking';

export function CompetitorChart() {
  const allMetrics = getAllMetrics();
  const yourBrand = getYourBrandMetrics();
  const competitors = allMetrics.filter(m => !m.isUser).slice(0, 3);
  
  // Create chart data - single point showing current visibility
  const chartData = [{
    date: 'Current',
    yourBrand: yourBrand.visibility,
    competitor1: competitors[0]?.visibility || 0,
    competitor2: competitors[1]?.visibility || 0,
    competitor3: competitors[2]?.visibility || 0,
  }];

  return (
    <div className="chart-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Competitive Landscape</h3>
        <p className="text-sm text-muted-foreground">Current visibility score comparison</p>
      </div>
      <div className="h-[350px]">
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
              dataKey="yourBrand"
              name="Samlino"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            {competitors[0] && (
              <Line
                type="monotone"
                dataKey="competitor1"
                name={competitors[0].name}
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            )}
            {competitors[1] && (
              <Line
                type="monotone"
                dataKey="competitor2"
                name={competitors[1].name}
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            )}
            {competitors[2] && (
              <Line
                type="monotone"
                dataKey="competitor3"
                name={competitors[2].name}
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
