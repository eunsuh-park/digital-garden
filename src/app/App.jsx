import { HashRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@/widgets/app-shell/AppShell';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import LandingPage from '@/pages/Landing/LandingPage';
import LoginPage from '@/pages/login/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProjectPage from '@/pages/project/ProjectPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/project" element={<ProjectPage />} />
            {/* Tasks/Plants UI는 MapSidePanel(하단 시트)에 표시, 본문은 지도 유지 */}
            <Route path="/tasks" element={<LandingPage />} />
            <Route path="/plants" element={<LandingPage />} />
            <Route path="*" element={<ErrorState variant="404" />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
