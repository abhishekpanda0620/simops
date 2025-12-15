import type { ControlPlaneComponent, K8sNode, K8sPod, K8sService, K8sIngress, K8sPV, K8sPVC, K8sConfigMap, K8sSecret, K8sDeployment } from '@/types';

export type SelectedItem =
  | { type: 'controlPlane'; data: ControlPlaneComponent }
  | { type: 'node'; data: K8sNode }
  | { type: 'pod'; data: K8sPod }
  | { type: 'service'; data: K8sService }
  | { type: 'ingress'; data: K8sIngress }
  | { type: 'pv'; data: K8sPV }
  | { type: 'pvc'; data: K8sPVC }
  | { type: 'configMap'; data: K8sConfigMap }
  | { type: 'secret'; data: K8sSecret }
  | { type: 'info'; data: { id: 'controlPlaneIntro' | 'workerNodesIntro' } }
  | { type: 'nodeComponent'; data: { nodeId: string; component: 'kubelet' | 'kube-proxy'; nodeName: string } }
  | { type: 'deployment'; data: K8sDeployment }
  | null;
