
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  DashboardPage,
  TopologyPage,
  PipelinePage,
  LabsPage,
  SettingsPage,
  LoginPage,
} from '@/pages';
import './index.css';

function AuthRoutes() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/topology" element={<TopologyPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/labs" element={<LabsPage />} />
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
