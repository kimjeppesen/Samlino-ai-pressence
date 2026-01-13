import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down';
  description?: string;
  suffix?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  change,
  trend,
  description,
  suffix,
  className,
}: KPICardProps) {
  const isPositive = trend === 'up';

  return (
    <div className={cn('kpi-card', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-lg text-muted-foreground ml-1">{suffix}</span>}
      </div>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
