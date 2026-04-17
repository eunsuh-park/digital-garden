import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/widgets/AppShell/AppShell';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import LandingPage from '@/pages/Landing/LandingPage';
import LoginPage from '@/pages/Login/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import ProjectSetupPage from '@/pages/ProjectSetup/ProjectSetupPage';
import ProjectMapBuilderPage from '@/pages/ProjectMapBuilder/ProjectMapBuilderPage';
import ProjectStep3Page from '@/pages/ProjectStep3/ProjectStep3Page';
import UiLabPage from '@/pages/UiLab/UiLabPage';
import TokenLabPage from '@/pages/TokenLab/TokenLabPage';
import { AuthProvider } from '@/app/providers/AuthContext';
import RequireAuth from '@/app/providers/RequireAuth';
import GlobalScrollbar from '@/shared/ui/scrollbar/GlobalScrollbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <GlobalScrollbar />
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/project" element={<Navigate to="/project/new" replace />} />
                <Route path="/project/new" element={<ProjectSetupPage />} />
                <Route path="/project/:projectId/map-builder" element={<ProjectMapBuilderPage />} />
                <Route path="/project/:projectId/step3" element={<ProjectStep3Page />} />
                <Route path="/project/:projectId/tasks" element={<LandingPage />} />
                <Route path="/project/:projectId/plants" element={<LandingPage />} />
                <Route path="/project/:projectId" element={<LandingPage />} />
                <Route path="/ui-lab" element={<UiLabPage />} />
                <Route path="/token-lab" element={<TokenLabPage />} />
                {/* 레거시 경로 → 홈(대시보드) */}
                <Route path="/tasks" element={<Navigate to="/" replace />} />
                <Route path="/plants" element={<Navigate to="/" replace />} />
                <Route path="*" element={<ErrorState variant="404" />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
