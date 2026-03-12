import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import ErrorState from './components/ErrorState/ErrorState';
import LandingPage from './pages/Landing/LandingPage';
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
