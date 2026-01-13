import { ArrowRight, Zap, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
  platforms: string[];
  className?: string;
}

const impactConfig = {
  high: { label: 'High Impact', className: 'bg-success/10 text-success' },
  medium: { label: 'Medium Impact', className: 'bg-warning/10 text-warning' },
  low: { label: 'Low Impact', className: 'bg-muted text-muted-foreground' },
};

const effortConfig = {
  high: { label: 'High Effort', className: 'text-destructive' },
  medium: { label: 'Medium Effort', className: 'text-warning' },
  low: { label: 'Quick Win', className: 'text-success' },
};

export function RecommendationCard({
  title,
  description,
  impact,
  effort,
  category,
  platforms,
  className,
}: RecommendationCardProps) {
  return (
    <div className={cn('kpi-card group cursor-pointer', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn('platform-badge', impactConfig[impact].className)}>
            <Zap className="w-3 h-3" />
            {impactConfig[impact].label}
          </span>
          <span className="platform-badge bg-secondary text-secondary-foreground">
            {category}
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={cn('font-medium', effortConfig[effort].className)}>
            {effortConfig[effort].label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                className="text-xs text-muted-foreground"
              >
                {platform}
                {platforms.indexOf(platform) < Math.min(platforms.length, 3) - 1 && ','}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
