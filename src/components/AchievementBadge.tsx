import type { Achievement } from '../data/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
}

export default function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
        unlocked
          ? 'badge-pop border-term-amber/60 bg-term-amber/5'
          : 'border-term-border bg-term-panel opacity-40 grayscale'
      }`}
      title={achievement.description}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-sm font-bold ${
          unlocked ? 'border-term-amber text-term-amber' : 'border-term-dim text-term-dim'
        }`}
      >
        {achievement.icon}
      </div>
      <div className={`text-sm font-bold ${unlocked ? 'text-term-text' : 'text-term-dim'}`}>
        {achievement.title}
      </div>
      <div className="text-xs leading-snug text-term-dim">{achievement.description}</div>
      {!unlocked && <div className="text-[10px] uppercase tracking-widest text-term-dim">locked</div>}
    </div>
  );
}
