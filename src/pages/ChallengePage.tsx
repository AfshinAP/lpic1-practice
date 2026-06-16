import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { topics, getModulesByTopic } from '../data/modules';
import { getChallengeByTopic } from '../data/challenges';
import type { Achievement } from '../data/achievements';
import { useProgress } from '../hooks/useProgress';
import ChallengeTerminal from '../components/ChallengeTerminal';
import AchievementToast from '../components/AchievementToast';

export default function ChallengePage() {
  const { topicId } = useParams<{ topicId: string }>();
  const {
    completedExercises,
    completedChallengeSteps,
    completeChallengeStep,
    isChallengeStepComplete,
  } = useProgress();

  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [challengeDone, setChallengeDone] = useState(false);

  const topic = topics.find((t) => t.id === topicId);
  const challenge = topicId ? getChallengeByTopic(topicId) : undefined;
  const topicModules = topicId ? getModulesByTopic(topicId) : [];

  if (!topic || !challenge) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-term-red">Challenge not found.</p>
        <Link to="/" className="text-term-blue underline">
          ← back to dashboard
        </Link>
      </div>
    );
  }

  // Determine unlock: every module in this topic must have all exercises + quizzes complete
  const incompleteModules = topicModules.filter((m) => {
    const exercisesDone = m.exercises.every((e) => completedExercises.has(e.id));
    const quizzesDone = (m.quizzes ?? []).every((q) => completedExercises.has(q.id));
    return !(exercisesDone && quizzesDone);
  });
  const unlocked = incompleteModules.length === 0;

  // Resume from first incomplete step
  const initialStepIndex = Math.max(
    0,
    challenge.steps.findIndex((s) => !isChallengeStepComplete(s.id)),
  );
  const alreadyFinished =
    challengeDone || challenge.steps.every((s) => completedChallengeSteps.has(s.id));

  const onStepSolved = useCallback(
    (stepId: string): Achievement[] => {
      const unlocked = completeChallengeStep(stepId);
      if (unlocked.length > 0) {
        setToasts((prev) => [...prev, ...unlocked]);
      }
      return unlocked;
    },
    [completeChallengeStep],
  );

  const onChallengeComplete = useCallback(() => {
    setChallengeDone(true);
  }, []);

  // ── Locked view ────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="text-sm text-term-dim hover:text-term-text">
          ← all topics
        </Link>

        <header className="mt-6 mb-8">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-term-amber">
            Topic {topic.id} — {topic.title}
          </div>
          <h1 className="text-2xl font-bold text-term-text">{challenge.title}</h1>
          <p className="mt-3 leading-relaxed text-term-dim">{challenge.scenario}</p>
        </header>

        <div className="rounded-lg border border-term-border bg-term-panel p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔒</span>
            <div>
              <p className="font-bold text-term-amber">Challenge Locked</p>
              <p className="mt-1 text-sm text-term-dim">
                Complete all exercises and quizzes in every module of Topic {topic.id} to unlock this
                scenario.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-term-dim">
              Modules still in progress ({incompleteModules.length} remaining):
            </p>
            <ul className="space-y-2">
              {incompleteModules.map((m) => {
                const exerciseDone = m.exercises.filter((e) => completedExercises.has(e.id)).length;
                const quizDone = (m.quizzes ?? []).filter((q) => completedExercises.has(q.id)).length;
                const total = m.exercises.length + (m.quizzes?.length ?? 0);
                const done = exerciseDone + quizDone;
                return (
                  <li key={m.id}>
                    <Link
                      to={`/module/${m.id}`}
                      className="flex items-center justify-between rounded-lg border border-term-border bg-black/30 px-4 py-3 transition-colors hover:border-term-blue/60 hover:bg-term-border/30"
                    >
                      <span className="font-bold text-term-text">
                        {m.id} — {m.title}
                      </span>
                      <span className="text-sm text-term-amber">
                        {done}/{total} done →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Unlocked view ──────────────────────────────────────────────────────────
  const completedCount = challenge.steps.filter((s) => completedChallengeSteps.has(s.id)).length;
  const currentStep = alreadyFinished ? undefined : challenge.steps[initialStepIndex];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between text-sm">
        <Link to="/" className="text-term-dim hover:text-term-text">
          ← all topics
        </Link>
        <span className="text-term-dim">
          Topic {topic.id} · {challenge.steps.length} steps
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Side panel */}
        <div className="space-y-4">
          <div className="rounded-lg border border-term-border bg-term-panel p-5">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-term-amber">
              Topic Challenge · {topic.id} {topic.title}
            </div>
            <h1 className="text-xl font-bold text-term-text">{challenge.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-term-dim">{challenge.scenario}</p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-term-dim">
                <span>Progress</span>
                <span className={alreadyFinished ? 'text-term-green' : 'text-term-amber'}>
                  {alreadyFinished ? challenge.steps.length : completedCount}/{challenge.steps.length} steps
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-term-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-term-blue to-term-green transition-all duration-500"
                  style={{
                    width: `${Math.round(((alreadyFinished ? challenge.steps.length : completedCount) / challenge.steps.length) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Current step card */}
          {currentStep && !alreadyFinished && (
            <div className="rounded-lg border border-term-blue/40 bg-term-panel p-5">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-term-blue">
                Current step ({initialStepIndex + 1}/{challenge.steps.length})
              </div>
              <h2 className="font-bold text-term-text">{currentStep.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-term-dim">{currentStep.description}</p>
            </div>
          )}

          {/* Completion card */}
          {alreadyFinished && (
            <div className="rounded-lg border border-term-green/50 bg-term-green/5 p-5">
              <p className="font-bold text-term-green">Incident Resolved</p>
              <p className="mt-1 text-sm text-term-dim">
                All {challenge.steps.length} steps completed. Check the Achievements page for your
                badge.
              </p>
              <Link
                to="/achievements"
                className="mt-3 inline-block text-sm text-term-blue underline hover:text-term-text"
              >
                View achievements →
              </Link>
            </div>
          )}

          {/* Step list */}
          <div className="rounded-lg border border-term-border bg-term-panel p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-term-dim">All Steps</p>
            <ol className="space-y-2">
              {challenge.steps.map((s, i) => {
                const done = completedChallengeSteps.has(s.id);
                const isCurrent = !alreadyFinished && i === initialStepIndex;
                return (
                  <li
                    key={s.id}
                    className={`flex items-start gap-3 rounded px-2 py-1.5 text-sm ${
                      isCurrent ? 'bg-term-blue/10' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        done
                          ? 'border-term-green text-term-green'
                          : isCurrent
                            ? 'border-term-blue text-term-blue'
                            : 'border-term-dim text-term-dim'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span className={done ? 'text-term-dim line-through' : isCurrent ? 'text-term-text font-bold' : 'text-term-dim'}>
                      {s.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Terminal */}
        {alreadyFinished ? (
          <div className="flex items-center justify-center rounded-lg border border-term-green/40 bg-black/40 p-8 text-center">
            <div>
              <p className="text-4xl">✓</p>
              <p className="mt-3 text-lg font-bold text-term-green">Incident Resolved</p>
              <p className="mt-2 text-sm text-term-dim">All steps have been completed.</p>
            </div>
          </div>
        ) : (
          <ChallengeTerminal
            challenge={challenge}
            initialStepIndex={initialStepIndex}
            onStepSolved={onStepSolved}
            onChallengeComplete={onChallengeComplete}
          />
        )}
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((a) => (
          <AchievementToast
            key={a.id}
            achievement={a}
            onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== a.id))}
          />
        ))}
      </div>
    </div>
  );
}
