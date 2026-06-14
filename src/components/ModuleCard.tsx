import { Link } from 'react-router-dom';
import type { Module } from '../data/types';

interface ModuleCardProps {
  module: Module;
  completedCount: number;
}

export default function ModuleCard({ module, completedCount }: ModuleCardProps) {
  const total = module.exercises.length + (module.quizzes?.length ?? 0);
  const done = completedCount === total;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  // SVG progress ring
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const offset = total === 0 ? circumference : circumference * (1 - completedCount / total);

  return (
    <Link
      to={`/module/${module.id}`}
      className={`group flex items-center gap-4 rounded-lg border p-4 transition-colors ${
        done
          ? 'border-term-green/50 bg-term-green/5 hover:bg-term-green/10'
          : 'border-term-border bg-term-panel hover:border-term-blue/60 hover:bg-term-border/30'
      }`}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-term-border)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={done ? 'var(--color-term-green)' : 'var(--color-term-blue)'}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`font-bold ${done ? 'text-term-green' : 'text-term-blue'}`}>{module.id}</span>
          {done && <span className="text-xs text-term-green">complete</span>}
        </div>
        <div className="truncate text-sm text-term-text group-hover:whitespace-normal">{module.title}</div>
        <div className="text-xs text-term-dim">
          {completedCount}/{total} items · {pct}%
        </div>
      </div>
    </Link>
  );
}
