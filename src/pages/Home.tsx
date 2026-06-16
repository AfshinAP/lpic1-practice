import { Link } from 'react-router-dom';
import { topics, getModulesByTopic, totalItems } from '../data/modules';
import { achievements } from '../data/achievements';
import { useProgress } from '../hooks/useProgress';
import TopicGroup from '../components/TopicGroup';

export default function Home() {
  const { completedExercises, unlockedAchievements, completedChallengeSteps } = useProgress();
  const done = completedExercises.size;
  const pct = Math.round((done / totalItems) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="text-term-green">$</span> LPIC-1 Practice Terminal
        </h1>
        <p className="mt-2 text-term-dim">
          Hands-on command-line challenges for every LPIC-1 objective, 101.1 through 110.3 — based on{' '}
          <a
            href="https://linux1st.com/archives.html"
            target="_blank"
            rel="noreferrer"
            className="text-term-blue underline hover:text-term-text"
          >
            lpic1book
          </a>
          .
        </p>

        <div className="mt-6 rounded-lg border border-term-border bg-term-panel p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>
              Overall progress:{' '}
              <span className="font-bold text-term-text">
                {done}/{totalItems}
              </span>{' '}
              items ({pct}%)
            </span>
            <Link to="/achievements" className="text-term-amber hover:underline">
              achievements: {unlockedAchievements.size}/{achievements.length} →
            </Link>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-term-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-term-blue to-term-green transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="space-y-10">
        {topics.map((t) => (
          <TopicGroup
            key={t.id}
            topic={t}
            modules={getModulesByTopic(t.id)}
            completedExercises={completedExercises}
            completedChallengeSteps={completedChallengeSteps}
          />
        ))}
      </div>
    </div>
  );
}
