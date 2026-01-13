import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformCardProps {
  name: string;
  icon: string;
  visibility: number;
  mentions: number;
  sentiment: number;
  change: number;
  trend: 'up' | 'down';
  color: string;
  className?: string;
}

export function PlatformCard({
  name,
  icon,
  visibility,
  mentions,
  sentiment,
  change,
  trend,
  className,
}: PlatformCardProps) {
  const isPositive = trend === 'up';

  return (
    <div className={cn('kpi-card group', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-foreground">{name}</h3>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-success' : 'text-destructive'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>

      {/* Visibility Score Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Visibility Score</span>
          <span className="font-semibold text-foreground">{visibility}/100</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${visibility}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground">Mentions</p>
          <p className="text-lg font-semibold text-foreground">{mentions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sentiment</p>
          <p className="text-lg font-semibold text-foreground">{sentiment}%</p>
        </div>
      </div>
    </div>
  );
}
