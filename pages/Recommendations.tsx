import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { recommendations } from '@/lib/mockData';
import { Lightbulb, Zap, Target, TrendingUp } from 'lucide-react';

export default function Recommendations() {
  const highImpact = recommendations.filter((r) => r.impact === 'high');
  const quickWins = recommendations.filter((r) => r.effort === 'low');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Recommendations</h1>
          <p className="page-description">
            AI-powered suggestions to improve your visibility
          </p>
        </div>
        <FilterBar showPlatformFilter={false} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{recommendations.length}</p>
            <p className="text-sm text-muted-foreground">Total Suggestions</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{highImpact.length}</p>
            <p className="text-sm text-muted-foreground">High Impact</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{quickWins.length}</p>
            <p className="text-sm text-muted-foreground">Quick Wins</p>
          </div>
        </div>

        <div className="kpi-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">+15</p>
            <p className="text-sm text-muted-foreground">Potential Score Gain</p>
          </div>
        </div>
      </div>

      {/* High Impact Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">High Impact Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highImpact.map((rec, index) => (
            <RecommendationCard
              key={rec.id}
              {...rec}
              className={`animate-fade-in stagger-${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Wins Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Quick Wins</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickWins.map((rec, index) => (
            <RecommendationCard
              key={rec.id}
              {...rec}
              className={`animate-fade-in stagger-${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* All Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">All Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <RecommendationCard
              key={rec.id}
              {...rec}
              className={`animate-fade-in stagger-${(index % 5) + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
