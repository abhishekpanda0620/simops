import { Header } from '@/components/layout';
import { Card } from '@/components/ui';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="h-full flex flex-col">
      <Header title={title} />
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-4 rounded-full bg-primary-900/30">
              <Construction className="w-12 h-12 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-surface-100 mb-2">
                Coming Soon
              </h2>
              <p className="text-surface-400">{description}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PipelinePage() {
  return (
    <PlaceholderPage
      title="CI/CD Pipeline"
      description="DAG-based pipeline visualization with logs. Week 4 milestone."
    />
  );
}

export function LabsPage() {
  return (
    <PlaceholderPage
      title="Interactive Labs"
      description="Guided hands-on labs with auto-grading. Phase 1B milestone."
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure your learning environment preferences."
    />
  );
}
