import { Header } from '@/components/layout';
import { Card, CardHeader, CardContent, Badge, StatusIndicator } from '@/components/ui';
import { useClusterStore, usePipelineStore } from '@/store';
import { useEffect } from 'react';
import {
  Server,
  Container,
  Network,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatDuration } from '@/utils';

export function DashboardPage() {
  const { currentCluster, loadScenario: loadCluster } = useClusterStore();
  const { currentPipeline, loadScenario: loadPipeline } = usePipelineStore();

  useEffect(() => {
    loadCluster('healthy');
    loadPipeline('success');
  }, [loadCluster, loadPipeline]);

  const stats = [
    {
      icon: Server,
      label: 'Nodes',
      value: currentCluster?.nodes.length ?? 0,
      status: 'success' as const,
    },
    {
      icon: Container,
      label: 'Pods',
      value: currentCluster?.pods.length ?? 0,
      status: 'success' as const,
    },
    {
      icon: Network,
      label: 'Services',
      value: currentCluster?.services.length ?? 0,
      status: 'success' as const,
    },
    {
      icon: GitBranch,
      label: 'Pipeline',
      value: currentPipeline?.status === 'succeeded' ? 'Passed' : 'Failed',
      status: currentPipeline?.status === 'succeeded' ? 'success' as const : 'error' as const,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <Header title="Dashboard" subtitle="Overview of your DevOps environment" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, status }) => (
            <Card key={label} variant="interactive">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  status === 'success' ? 'bg-success-900/30' : 'bg-error-900/30'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    status === 'success' ? 'text-success-400' : 'text-error-400'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-surface-400">{label}</p>
                  <p className="text-2xl font-bold text-surface-100">{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cluster Health */}
          <Card>
            <CardHeader
              title="Cluster Health"
              subtitle={currentCluster?.name}
              action={<Badge variant="success" dot pulse>Healthy</Badge>}
            />
            <CardContent>
              <div className="space-y-3">
                {currentCluster?.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIndicator status={node.status} />
                      <div>
                        <p className="font-medium text-surface-200">{node.name}</p>
                        <p className="text-xs text-surface-400">
                          {node.role === 'control-plane' ? 'Control Plane' : 'Worker'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-surface-300">{node.pods.length} pods</p>
                      <p className="text-surface-500">
                        CPU: {Math.round((node.cpu.used / node.cpu.total) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Pipeline */}
          <Card>
            <CardHeader
              title="Recent Pipeline"
              subtitle={currentPipeline?.trigger.commit.message}
              action={
                currentPipeline?.status === 'succeeded' ? (
                  <Badge variant="success" dot>Passed</Badge>
                ) : (
                  <Badge variant="error" dot>Failed</Badge>
                )
              }
            />
            <CardContent>
              <div className="space-y-3">
                {currentPipeline?.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                  >
                    <div className="flex items-center gap-3">
                      {stage.status === 'succeeded' && (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      )}
                      {stage.status === 'failed' && (
                        <XCircle className="w-5 h-5 text-error-500" />
                      )}
                      {stage.status === 'skipped' && (
                        <Clock className="w-5 h-5 text-surface-500" />
                      )}
                      <span className="font-medium text-surface-200">{stage.name}</span>
                    </div>
                    <span className="text-sm text-surface-400">
                      {stage.duration ? formatDuration(stage.duration) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'View Topology', href: '/topology', icon: Network },
                { label: 'View Pipeline', href: '/pipeline', icon: GitBranch },
                { label: 'Start Lab', href: '/labs', icon: Container },
                { label: 'Settings', href: '/settings', icon: Server },
              ].map(({ label, href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-surface-800/50 hover:bg-surface-700/50 transition-colors"
                >
                  <Icon className="w-8 h-8 text-primary-400" />
                  <span className="text-sm font-medium text-surface-200">{label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
