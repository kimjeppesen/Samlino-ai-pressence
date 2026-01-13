import { FilterBar } from '@/components/dashboard/FilterBar';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Recommendations() {

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

      {/* Empty State */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>
                Recommendations will appear here once you process queries and gather data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To get personalized recommendations:
          </p>
          <ol className="list-decimal list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Go to the <strong>Prompts & Queries</strong> page</li>
            <li>Upload a CSV file with your queries</li>
            <li>Process the queries through AI platforms</li>
            <li>Return here to see AI-powered recommendations based on your results</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
