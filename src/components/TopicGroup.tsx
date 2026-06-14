import type { Module, Topic } from '../data/types';
import ModuleCard from './ModuleCard';

interface TopicGroupProps {
  topic: Topic;
  modules: Module[];
  completedExercises: Set<string>;
}

function moduleItemIds(m: Module): string[] {
  return [...m.exercises.map((e) => e.id), ...(m.quizzes ?? []).map((q) => q.id)];
}

export default function TopicGroup({ topic, modules, completedExercises }: TopicGroupProps) {
  const allDone = modules.every((m) => moduleItemIds(m).every((id) => completedExercises.has(id)));

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-3 text-lg">
        <span className="text-term-dim">Topic</span>
        <span className={allDone ? 'font-bold text-term-green' : 'font-bold text-term-amber'}>{topic.id}</span>
        <span className="text-term-text">{topic.title}</span>
        {allDone && <span className="rounded border border-term-green/50 px-2 py-0.5 text-xs text-term-green">champion</span>}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard
            key={m.id}
            module={m}
            completedCount={moduleItemIds(m).filter((id) => completedExercises.has(id)).length}
          />
        ))}
      </div>
    </section>
  );
}
