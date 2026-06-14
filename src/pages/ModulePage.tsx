import { Link, useParams } from 'react-router-dom';
import { getModule } from '../data/modules';
import { useProgress } from '../hooks/useProgress';

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = moduleId ? getModule(moduleId) : undefined;
  const { isExerciseComplete } = useProgress();

  if (!module) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-term-red">Module not found.</p>
        <Link to="/" className="text-term-blue underline">
          ← back to dashboard
        </Link>
      </div>
    );
  }

  const quizzes = module.quizzes ?? [];
  const exerciseDone = module.exercises.filter((e) => isExerciseComplete(e.id)).length;
  const quizDone = quizzes.filter((q) => isExerciseComplete(q.id)).length;
  const doneCount = exerciseDone + quizDone;
  const total = module.exercises.length + quizzes.length;
  const allDone = doneCount === total;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-term-dim hover:text-term-text">
        ← all modules
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-bold">
          <span className={allDone ? 'text-term-green' : 'text-term-blue'}>{module.id}</span>{' '}
          {module.title}
        </h1>
        <p className="mt-1 text-term-dim">{module.description}</p>
        <p className="mt-2 text-sm">
          <span className={allDone ? 'text-term-green' : 'text-term-amber'}>
            {doneCount}/{total}
          </span>{' '}
          <span className="text-term-dim">items completed</span>
          {allDone && <span className="ml-2 rounded border border-term-green/50 px-2 py-0.5 text-xs text-term-green">module master</span>}
        </p>
      </header>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-term-blue">
        Command Practice
      </h2>
      <ol className="space-y-3">
        {module.exercises.map((ex, i) => {
          const done = isExerciseComplete(ex.id);
          return (
            <li key={ex.id}>
              <Link
                to={`/module/${module.id}/exercise/${ex.id}`}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                  done
                    ? 'border-term-green/50 bg-term-green/5 hover:bg-term-green/10'
                    : 'border-term-border bg-term-panel hover:border-term-blue/60 hover:bg-term-border/30'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    done ? 'border-term-green text-term-green' : 'border-term-dim text-term-dim'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-term-text">{ex.title}</div>
                  <div className="truncate text-sm text-term-dim">{ex.description}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {quizzes.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 text-xs font-bold uppercase tracking-wider text-term-amber">
            Concept Quiz
          </h2>
          <ol className="space-y-3">
            {quizzes.map((q, i) => {
              const done = isExerciseComplete(q.id);
              return (
                <li key={q.id}>
                  <Link
                    to={`/module/${module.id}/quiz/${q.id}`}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                      done
                        ? 'border-term-green/50 bg-term-green/5 hover:bg-term-green/10'
                        : 'border-term-border bg-term-panel hover:border-term-amber/60 hover:bg-term-border/30'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                        done ? 'border-term-green text-term-green' : 'border-term-dim text-term-dim'
                      }`}
                    >
                      {done ? '✓' : `Q${i + 1}`}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-term-text">{q.question}</div>
                      <div className="text-sm text-term-dim">multiple choice · 4 options</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
