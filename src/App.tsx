import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ModulePage from './pages/ModulePage';
import ExercisePage from './pages/ExercisePage';
import AchievementsPage from './pages/AchievementsPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-term-bg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/module/:moduleId/exercise/:exerciseId" element={<ExercisePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
