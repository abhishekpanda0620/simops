import type { StoreSlice } from './types';
import type { K8sPod, K8sService, K8sIngress, ControlPlaneComponent, K8sStatefulSet, K8sDaemonSet, K8sPV, K8sPVC, K8sDeployment, K8sJob, K8sCronJob, K8sConfigMap, K8sSecret, K8sHPA, K8sRole, K8sRoleBinding } from '@/types';

export interface SelectionSlice {
  selectedPod: K8sPod | null;
  selectedService: K8sService | null;
  selectedIngress: K8sIngress | null;
  selectedControlPlane: ControlPlaneComponent | null;
  selectedNodeId: string | null;
  selectedStatefulSet: K8sStatefulSet | null;
  selectedDaemonSet: K8sDaemonSet | null;
  selectedDeployment: K8sDeployment | null;
  selectedPV: K8sPV | null;
  selectedPVC: K8sPVC | null;
  selectedJob: K8sJob | null;
  selectedCronJob: K8sCronJob | null;
  selectedConfigMap: K8sConfigMap | null;
  selectedSecret: K8sSecret | null;
  selectedHPA: K8sHPA | null;
  selectedRole: K8sRole | null;
  selectedRoleBinding: K8sRoleBinding | null;

  selectPod: (pod: K8sPod | null) => void;
  selectService: (service: K8sService | null) => void;
  selectIngress: (ingress: K8sIngress | null) => void;
  selectControlPlane: (component: ControlPlaneComponent | null) => void;
  selectNode: (nodeId: string | null) => void;
  selectStatefulSet: (sts: K8sStatefulSet | null) => void;
  selectDaemonSet: (ds: K8sDaemonSet | null) => void;
  selectDeployment: (deploy: K8sDeployment | null) => void;
  selectPV: (pv: K8sPV | null) => void;
  selectPVC: (pvc: K8sPVC | null) => void;
  selectJob: (job: K8sJob | null) => void;
  selectCronJob: (cronJob: K8sCronJob | null) => void;
  selectConfigMap: (cm: K8sConfigMap | null) => void;
  selectSecret: (secret: K8sSecret | null) => void;
  selectHPA: (hpa: K8sHPA | null) => void;
  selectRole: (role: K8sRole | null) => void;
  selectRoleBinding: (rb: K8sRoleBinding | null) => void;
  clearSelection: () => void;
}

const initialSelectionState = {
  selectedPod: null,
  selectedService: null,
  selectedIngress: null,
  selectedControlPlane: null,
  selectedNodeId: null,
  selectedStatefulSet: null,
  selectedDaemonSet: null,
  selectedDeployment: null,
  selectedPV: null,
  selectedPVC: null,
  selectedJob: null,
  selectedCronJob: null,
  selectedConfigMap: null,
  selectedSecret: null,
  selectedHPA: null,
  selectedRole: null,
  selectedRoleBinding: null,
};

export const createSelectionSlice: StoreSlice<SelectionSlice> = (set) => ({
  ...initialSelectionState,

  selectPod: (pod) => set({ ...initialSelectionState, selectedPod: pod }),
  selectService: (service) => set({ ...initialSelectionState, selectedService: service }),
  selectIngress: (ingress) => set({ ...initialSelectionState, selectedIngress: ingress }),
  selectControlPlane: (component) => set({ ...initialSelectionState, selectedControlPlane: component }),
  selectNode: (nodeId) => set({ ...initialSelectionState, selectedNodeId: nodeId }),
  selectStatefulSet: (sts) => set({ ...initialSelectionState, selectedStatefulSet: sts }),
  selectDaemonSet: (ds) => set({ ...initialSelectionState, selectedDaemonSet: ds }),
  selectDeployment: (deploy) => set({ ...initialSelectionState, selectedDeployment: deploy }),
  selectPV: (pv) => set({ ...initialSelectionState, selectedPV: pv }),
  selectPVC: (pvc) => set({ ...initialSelectionState, selectedPVC: pvc }),
  selectJob: (job) => set({ ...initialSelectionState, selectedJob: job }),
  selectCronJob: (cronJob) => set({ ...initialSelectionState, selectedCronJob: cronJob }),
  selectConfigMap: (cm) => set({ ...initialSelectionState, selectedConfigMap: cm }),
  selectSecret: (secret) => set({ ...initialSelectionState, selectedSecret: secret }),
  selectHPA: (hpa) => set({ ...initialSelectionState, selectedHPA: hpa }),
  selectRole: (role) => set({ ...initialSelectionState, selectedRole: role }),
  selectRoleBinding: (rb) => set({ ...initialSelectionState, selectedRoleBinding: rb }),
  
  clearSelection: () => set(initialSelectionState),
});
