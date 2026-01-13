import { TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllMetrics } from '@/lib/services/competitorTracking';

export function CompetitorTable() {
  const allMetrics = getAllMetrics();
  const sortedData = [...allMetrics].sort((a, b) => b.visibility - a.visibility);

  return (
    <div className="data-table">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Competitor Rankings</h3>
        <p className="text-sm text-muted-foreground">How you compare in AI visibility</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rank</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Brand</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Visibility</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Mentions</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Sentiment</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Growth</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const isPositive = row.growth > 0;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    row.isUser ? 'bg-primary/5' : 'hover:bg-muted/20'
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Crown className="w-4 h-4 text-warning" />}
                      <span className="font-semibold text-foreground">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium',
                        row.isUser ? 'text-primary' : 'text-foreground'
                      )}>
                        {row.name}
                      </span>
                      {row.isUser && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            row.isUser ? 'bg-primary' : 'bg-muted-foreground/50'
                          )}
                          style={{ width: `${row.visibility}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-8">
                        {row.visibility}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium text-foreground">
                      {row.mentions.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium text-foreground">{row.sentiment}%</span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 font-medium',
                        isPositive ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {isPositive ? '+' : ''}{row.growth}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
