import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import ErrorState from './components/ErrorState/ErrorState';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/login/LoginPage';
import ProjectPage from './pages/project/ProjectPage';
import TasksPage from './pages/Tasks/TasksPage';
import PlantsPage from './pages/Plants/PlantsPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout />}>
            <Route path="/map" element={<LandingPage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/plants" element={<PlantsPage />} />
          </Route>
          <Route path="*" element={<ErrorState variant="404" />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
