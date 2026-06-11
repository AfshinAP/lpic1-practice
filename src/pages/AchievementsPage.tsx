import { Link } from 'react-router-dom';
import { achievements } from '../data/achievements';
import { useProgress } from '../hooks/useProgress';
import AchievementBadge from '../components/AchievementBadge';

export default function AchievementsPage() {
  const { isAchievementUnlocked, unlockedAchievements, resetProgress } = useProgress();

  const general = achievements.filter((a) => !a.id.startsWith('module-') && !a.id.startsWith('topic-'));
  const moduleBadges = achievements.filter((a) => a.id.startsWith('module-'));
  const topicBadges = achievements.filter((a) => a.id.startsWith('topic-'));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="text-sm text-term-dim hover:text-term-text">
        ← all modules
      </Link>

      <header className="mt-4 mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-term-amber">★</span> Achievements
          </h1>
          <p className="mt-1 text-term-dim">
            {unlockedAchievements.size} of {achievements.length} unlocked
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset ALL progress and achievements?')) resetProgress();
          }}
          className="rounded border border-term-red/50 px-3 py-2 text-sm text-term-red transition-colors hover:bg-term-red/10"
        >
          reset progress
        </button>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-lg text-term-text">Milestones</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {general.map((a) => (
            <AchievementBadge key={a.id} achievement={a} unlocked={isAchievementUnlocked(a.id)} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg text-term-text">Topic Champions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {topicBadges.map((a) => (
            <AchievementBadge key={a.id} achievement={a} unlocked={isAchievementUnlocked(a.id)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg text-term-text">Module Masters</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {moduleBadges.map((a) => (
            <AchievementBadge key={a.id} achievement={a} unlocked={isAchievementUnlocked(a.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
