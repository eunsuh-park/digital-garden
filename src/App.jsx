import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import ErrorState from './components/ErrorState/ErrorState';
import LandingPage from './pages/Landing/LandingPage';
import TasksPage from './pages/Tasks/TasksPage';
import LocationsPage from './pages/Locations/LocationsPage';
import PlantsPage from './pages/Plants/PlantsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/plants" element={<PlantsPage />} />
            <Route path="*" element={<ErrorState variant="404" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
