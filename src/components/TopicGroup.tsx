import { Link } from 'react-router-dom';
import type { Module, Topic } from '../data/types';
import ModuleCard from './ModuleCard';
import { getChallengeByTopic } from '../data/challenges';

interface TopicGroupProps {
  topic: Topic;
  modules: Module[];
  completedExercises: Set<string>;
  completedChallengeSteps: Set<string>;
}

function moduleItemIds(m: Module): string[] {
  return [...m.exercises.map((e) => e.id), ...(m.quizzes ?? []).map((q) => q.id)];
}

export default function TopicGroup({
  topic,
  modules,
  completedExercises,
  completedChallengeSteps,
}: TopicGroupProps) {
  const allDone = modules.every((m) => moduleItemIds(m).every((id) => completedExercises.has(id)));
  const challenge = getChallengeByTopic(topic.id);
  const challengeComplete =
    challenge !== undefined &&
    challenge.steps.every((s) => completedChallengeSteps.has(s.id));
  const challengeStarted =
    challenge !== undefined &&
    challenge.steps.some((s) => completedChallengeSteps.has(s.id));
  const stepsCompleted = challenge
    ? challenge.steps.filter((s) => completedChallengeSteps.has(s.id)).length
    : 0;

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

      {/* Topic Challenge banner */}
      {challenge && (
        <div className="mt-3">
          {allDone ? (
            <Link
              to={`/topic/${topic.id}/challenge`}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                challengeComplete
                  ? 'border-term-green/50 bg-term-green/5 hover:bg-term-green/10'
                  : 'border-term-amber/60 bg-term-amber/5 hover:bg-term-amber/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{challengeComplete ? '✓' : '⚡'}</span>
                <div>
                  <span className={`text-sm font-bold ${challengeComplete ? 'text-term-green' : 'text-term-amber'}`}>
                    Topic Challenge
                  </span>
                  <span className="ml-2 text-sm text-term-dim">{challenge.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {challengeStarted && !challengeComplete && (
                  <span className="text-xs text-term-amber">
                    {stepsCompleted}/{challenge.steps.length} steps
                  </span>
                )}
                {challengeComplete ? (
                  <span className="rounded border border-term-green/50 px-2 py-0.5 text-xs text-term-green">
                    resolved
                  </span>
                ) : (
                  <span className="text-xs text-term-amber">
                    {challengeStarted ? 'resume →' : 'start →'}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-term-border bg-term-panel/50 px-4 py-3 opacity-60">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔒</span>
                <div>
                  <span className="text-sm font-bold text-term-dim">Topic Challenge</span>
                  <span className="ml-2 text-sm text-term-dim">{challenge.title}</span>
                </div>
              </div>
              <span className="text-xs text-term-dim">complete all modules to unlock</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
