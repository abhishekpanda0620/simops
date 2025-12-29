import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { api, type Lab } from '@/services/api';
import { ChevronLeft, Loader2, AlertCircle, RefreshCw, BookOpen, CheckCircle } from 'lucide-react';

export function LabWorkspacePage() {
  const { slug } = useParams<{ slug: string }>();
  const [lab, setLab] = useState<Lab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLab = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.labs.get(slug);
      setLab(response.lab);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lab');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLab();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
          <p className="text-surface-400">Loading lab environment...</p>
        </div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Lab Error" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md text-center p-6">
            <AlertCircle className="w-10 h-10 text-error-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-surface-100 mb-2">Failed to Load Lab</h3>
            <p className="text-surface-400 text-sm mb-4">{error || 'Lab not found'}</p>
            <div className="flex gap-3 justify-center">
              <Link to="/labs">
                <Button variant="ghost">Back to Labs</Button>
              </Link>
              <Button onClick={fetchLab} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-surface-800 bg-surface-900 px-6 py-4 flex items-center gap-4">
        <Link to="/labs" className="text-surface-400 hover:text-surface-200 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-surface-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-400" />
            {lab.title}
          </h1>
          <p className="text-sm text-surface-400">{lab.description}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Instructions Panel */}
          <Card className="lg:col-span-1 flex flex-col h-full">
            <div className="p-4 border-b border-surface-800">
              <h3 className="font-semibold text-surface-100">Instructions</h3>
            </div>
            <div className="p-4 flex-1 overflow-auto space-y-6">
              {lab.steps.map((step, index) => (
                <div key={step.id} className="relative pl-6 pb-6 border-l border-surface-700 last:pb-0">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-surface-800 border-2 border-surface-600 flex items-center justify-center text-xs font-bold text-surface-300">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-surface-200 mb-1">{step.title}</h4>
                    <p className="text-sm text-surface-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-surface-800 bg-surface-900/50">
              <Button className="w-full gap-2">
                <CheckCircle className="w-4 h-4" />
                Complete Lab
              </Button>
            </div>
          </Card>

          {/* Workspace Area */}
          <Card className="lg:col-span-2 flex items-center justify-center bg-surface-950 border-dashed">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-surface-900 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-surface-600" />
              </div>
              <h3 className="text-lg font-medium text-surface-300 mb-2">Interactive Workspace</h3>
              <p className="text-surface-500 max-w-sm mx-auto">
                This area will contain the interactive terminal or topology view for the lab exercises.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
