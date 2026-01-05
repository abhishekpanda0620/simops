
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  LandingPage,
  DashboardPage,
  TopologyPage,
  PipelinePage,
  DevSecOpsPage,
  LabsPage,
  LabWorkspacePage,
  SettingsPage,
  LoginPage,
} from '@/pages';
import './index.css';

// Wrapper for pages that require authentication
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse text-surface-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes - all wrapped in MainLayout */}
          <Route element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/topology" element={<TopologyPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/security" element={<DevSecOpsPage />} />
            <Route path="/labs" element={<LabsPage />} />
            <Route path="/labs/:slug" element={<LabWorkspacePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
