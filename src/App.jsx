import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import ErrorState from './components/ErrorState/ErrorState';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectPage from './pages/project/ProjectPage';
import TasksPage from './pages/Tasks/TasksPage';
import PlantsPage from './pages/Plants/PlantsPage';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Header />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/plants" element={<PlantsPage />} />
            <Route path="*" element={<ErrorState variant="404" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
