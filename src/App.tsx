import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ModulePage from './pages/ModulePage';
import ExercisePage from './pages/ExercisePage';
import QuizPage from './pages/QuizPage';
import AchievementsPage from './pages/AchievementsPage';
import ChallengePage from './pages/ChallengePage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-term-bg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/module/:moduleId/exercise/:exerciseId" element={<ExercisePage />} />
          <Route path="/module/:moduleId/quiz/:quizId" element={<QuizPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/topic/:topicId/challenge" element={<ChallengePage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
