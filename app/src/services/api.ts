/**
 * API Client for SimOps Backend
 * Connects to Laravel API at localhost:8000
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Token management
const getToken = (): string | null => localStorage.getItem('simops_token');
const setToken = (token: string) => localStorage.setItem('simops_token', token);
const clearToken = () => localStorage.removeItem('simops_token');

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface Lab {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: number | null;
  steps: Array<{ id: number; title: string; description: string }>;
  is_active: boolean;
}

export interface UserProgress {
  id: number;
  user_id: number;
  lab_id: number;
  completed_steps: number[];
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
}

export interface Scenario {
  id: string;
  name: string;
  category: string;
}

export interface K8sScenario {
  id: number;
  slug: string;
  name: string;
  description: string;
  data?: Record<string, unknown>; // Full ClusterSnapshot data
}

export interface Pipeline {
  id: number;
  slug: string;
  name: string;
  status: string;
  data?: Record<string, unknown>; // Full Pipeline data
}

// API Methods
export const api = {
  // Health check
  health: () => apiFetch<{ status: string; timestamp: string }>('/health'),

  // Auth
  auth: {
    register: async (name: string, email: string, password: string, password_confirmation: string) => {
      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });
      setToken(data.token);
      return data;
    },

    login: async (email: string, password: string) => {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      return data;
    },

    logout: async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } finally {
        clearToken();
      }
    },

    me: () => apiFetch<User>('/user'),
  },

  // Labs
  labs: {
    list: () => apiFetch<{ labs: Lab[] }>('/labs'),
    get: (slug: string) => apiFetch<{ lab: Lab; progress: UserProgress | null }>(`/labs/${slug}`),
    getProgress: (slug: string) => apiFetch<{ progress: UserProgress }>(`/labs/${slug}/progress`),
    updateProgress: (slug: string, completedSteps: number[], status: string) => 
      apiFetch<{ progress: UserProgress }>(`/labs/${slug}/progress`, {
        method: 'POST',
        body: JSON.stringify({ completed_steps: completedSteps, status }),
      }),
  },

  // Control Plane Scenarios (simulation actions)
  scenarios: {
    list: () => apiFetch<{ scenarios: Scenario[] }>('/scenarios'),
    status: (id: string) => apiFetch<{ scenario: string; status: string; phase: string | null }>(`/scenarios/${id}/status`),
  },

  // K8s Cluster Scenarios (cluster state snapshots)
  k8sScenarios: {
    list: () => apiFetch<{ scenarios: K8sScenario[] }>('/k8s-scenarios'),
    get: (slug: string) => apiFetch<{ scenario: K8sScenario }>(`/k8s-scenarios/${slug}`),
  },

  // CI/CD Pipelines
  pipelines: {
    list: () => apiFetch<{ pipelines: Pipeline[] }>('/pipelines'),
    get: (slug: string) => apiFetch<{ pipeline: Pipeline }>(`/pipelines/${slug}`),
  },
};

// Check if user is authenticated (has valid token)
export const isAuthenticated = (): boolean => !!getToken();

// Get stored token
export { getToken, setToken, clearToken };
