import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { api, type Lab } from '@/services/api';
import { BookOpen, Clock, BarChart3, Play, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const difficultyColors = {
  beginner: 'text-success-400 bg-success-500/10 border-success-500/30',
  intermediate: 'text-warning-400 bg-warning-500/10 border-warning-500/30',
  advanced: 'text-error-400 bg-error-500/10 border-error-500/30',
};

function LabCard({ lab }: { lab: Lab }) {
  return (
    <Card className="group hover:border-primary-500/50 transition-all duration-200">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-surface-100 group-hover:text-primary-300 transition-colors">
              {lab.title}
            </h3>
            <p className="text-sm text-surface-400 mt-1 line-clamp-2">
              {lab.description}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-primary-500/10">
            <BookOpen className="w-5 h-5 text-primary-400" />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-2 py-0.5 rounded border capitalize ${difficultyColors[lab.difficulty]}`}>
            {lab.difficulty}
          </span>
          {lab.estimated_time && (
            <span className="flex items-center gap-1 text-surface-400">
              <Clock className="w-4 h-4" />
              {lab.estimated_time} min
            </span>
          )}
          {lab.steps && (
            <span className="flex items-center gap-1 text-surface-400">
              <BarChart3 className="w-4 h-4" />
              {lab.steps.length} steps
            </span>
          )}
        </div>

        {/* Action */}
        <Button className="w-full gap-2 group-hover:bg-primary-500" variant="secondary">
          <Play className="w-4 h-4" />
          Start Lab
        </Button>
      </div>
    </Card>
  );
}

export function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.labs.list();
      setLabs(response.labs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load labs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Interactive Labs" 
        subtitle={`${labs.length} hands-on learning modules`}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
              <p className="text-surface-400">Loading labs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-64">
            <Card className="max-w-md text-center p-6">
              <AlertCircle className="w-10 h-10 text-error-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-surface-100 mb-2">Failed to Load Labs</h3>
              <p className="text-surface-400 text-sm mb-4">{error}</p>
              <Button onClick={fetchLabs} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </Card>
          </div>
        )}

        {/* Labs Grid */}
        {!isLoading && !error && (
          <div className="max-w-6xl mx-auto">
            {labs.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-surface-300">No Labs Available</h3>
                <p className="text-surface-500 text-sm">Check back soon for new content!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.map((lab) => (
                  <LabCard key={lab.id} lab={lab} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
