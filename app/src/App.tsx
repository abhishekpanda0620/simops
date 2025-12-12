import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import {
  DashboardPage,
  TopologyPage,
  PipelinePage,
  LabsPage,
  SettingsPage,
} from '@/pages';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/topology" element={<TopologyPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
