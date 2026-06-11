import { useEffect } from 'react';
import type { Achievement } from '../data/achievements';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  return (
    <div className="toast-in pointer-events-auto flex items-center gap-3 rounded-lg border border-term-amber/70 bg-term-panel px-4 py-3 shadow-2xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-term-amber text-xs font-bold text-term-amber">
        {achievement.icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-term-amber">achievement unlocked</div>
        <div className="text-sm font-bold text-term-text">{achievement.title}</div>
      </div>
      <button onClick={onDismiss} className="ml-2 text-term-dim hover:text-term-text" aria-label="dismiss">
        ✕
      </button>
    </div>
  );
}
