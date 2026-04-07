import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/widgets/app-shell/AppShell';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import LandingPage from '@/pages/Landing/LandingPage';
import LoginPage from '@/pages/Login/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import ProjectNewPage from '@/pages/ProjectNew/ProjectNewPage';
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
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/project" element={<Navigate to="/project/new" replace />} />
                <Route path="/project/new" element={<ProjectNewPage />} />
                <Route path="/project/:projectId" element={<LandingPage />} />
                <Route path="/ui-lab" element={<UiLabPage />} />
                <Route path="/token-lab" element={<TokenLabPage />} />
                {/* Tasks/Plants UI는 MapSidePanel(하단 시트)에 표시, 본문은 지도 유지 */}
                <Route path="/tasks" element={<LandingPage />} />
                <Route path="/plants" element={<LandingPage />} />
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
