
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  DashboardPage,
  TopologyPage,
  PipelinePage,
  LabsPage,
  LabWorkspacePage,
  SettingsPage,
  LoginPage,
} from '@/pages';
import './index.css';

function AuthRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-pulse text-surface-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/topology" element={<TopologyPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/labs/:slug" element={<LabWorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
