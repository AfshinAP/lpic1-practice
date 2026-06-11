import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getModule } from '../data/modules';
import type { Achievement } from '../data/achievements';
import { useProgress } from '../hooks/useProgress';
import Terminal from '../components/Terminal';
import AchievementToast from '../components/AchievementToast';

export default function ExercisePage() {
  const { moduleId, exerciseId } = useParams<{ moduleId: string; exerciseId: string }>();
  const navigate = useNavigate();
  const module = moduleId ? getModule(moduleId) : undefined;
  const exerciseIdx = module?.exercises.findIndex((e) => e.id === exerciseId) ?? -1;
  const exercise = exerciseIdx >= 0 ? module!.exercises[exerciseIdx] : undefined;

  const { isExerciseComplete, completeExercise, markHintUsed } = useProgress();
  const [toasts, setToasts] = useState<Achievement[]>([]);

  const onSolved = useCallback(() => {
    if (!exercise) return;
    const unlocked = completeExercise(exercise.id);
    if (unlocked.length > 0) {
      setToasts((prev) => [...prev, ...unlocked]);
    }
  }, [exercise, completeExercise]);

  const onHintUsed = useCallback(() => {
    if (exercise) markHintUsed(exercise.id);
  }, [exercise, markHintUsed]);

  if (!module || !exercise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-term-red">Exercise not found.</p>
        <Link to="/" className="text-term-blue underline">
          ← back to dashboard
        </Link>
      </div>
    );
  }

  const solved = isExerciseComplete(exercise.id);
  const next = module.exercises[exerciseIdx + 1];
  const prev = module.exercises[exerciseIdx - 1];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between text-sm">
        <Link to={`/module/${module.id}`} className="text-term-dim hover:text-term-text">
          ← {module.id} {module.title}
        </Link>
        <span className="text-term-dim">
          exercise {exerciseIdx + 1} / {module.exercises.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="rounded-lg border border-term-border bg-term-panel p-5">
            <h1 className="text-xl font-bold text-term-text">
              {exercise.title}
              {solved && <span className="ml-2 align-middle text-sm text-term-green">✓ solved</span>}
            </h1>
            <p className="mt-3 leading-relaxed text-term-dim">{exercise.description}</p>
            <div className="mt-4 rounded border border-term-border bg-black/40 p-3 text-xs text-term-dim">
              Type the command in the terminal and press Enter. <code className="text-term-amber">sudo</code> is
              optional unless stated. Type <code className="text-term-amber">hint</code> if you get stuck.
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {prev && (
              <button
                onClick={() => navigate(`/module/${module.id}/exercise/${prev.id}`)}
                className="rounded border border-term-border px-3 py-2 text-sm text-term-dim transition-colors hover:bg-term-border/40 hover:text-term-text"
              >
                ← previous
              </button>
            )}
            {next ? (
              <button
                onClick={() => navigate(`/module/${module.id}/exercise/${next.id}`)}
                className={`rounded border px-3 py-2 text-sm transition-colors ${
                  solved
                    ? 'border-term-green/60 bg-term-green/10 text-term-green hover:bg-term-green/20'
                    : 'border-term-border text-term-dim hover:bg-term-border/40 hover:text-term-text'
                }`}
              >
                next exercise →
              </button>
            ) : (
              solved && (
                <button
                  onClick={() => navigate(`/module/${module.id}`)}
                  className="rounded border border-term-green/60 bg-term-green/10 px-3 py-2 text-sm text-term-green transition-colors hover:bg-term-green/20"
                >
                  back to module →
                </button>
              )
            )}
          </div>
        </div>

        <Terminal exercise={exercise} solved={solved} onSolved={onSolved} onHintUsed={onHintUsed} />
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
