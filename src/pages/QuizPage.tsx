import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getModule } from '../data/modules';
import type { Achievement } from '../data/achievements';
import { useProgress } from '../hooks/useProgress';
import AchievementToast from '../components/AchievementToast';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const { moduleId, quizId } = useParams<{ moduleId: string; quizId: string }>();
  const navigate = useNavigate();
  const module = moduleId ? getModule(moduleId) : undefined;
  const quizzes = module?.quizzes ?? [];
  const quizIdx = quizzes.findIndex((q) => q.id === quizId);
  const quiz = quizIdx >= 0 ? quizzes[quizIdx] : undefined;

  const { isExerciseComplete, completeExercise } = useProgress();
  const [selected, setSelected] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);

  const answered = selected !== null;
  const solved = quiz ? isExerciseComplete(quiz.id) : false;

  const onSelect = (idx: number) => {
    if (!quiz || selected !== null) return;
    setSelected(idx);
    if (idx === quiz.correctIndex) {
      const unlocked = completeExercise(quiz.id);
      if (unlocked.length > 0) setToasts((prev) => [...prev, ...unlocked]);
    }
  };

  if (!module || !quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-term-red">Quiz question not found.</p>
        <Link to="/" className="text-term-blue underline">
          ← back to dashboard
        </Link>
      </div>
    );
  }

  const next = quizzes[quizIdx + 1];
  const prev = quizzes[quizIdx - 1];
  const isCorrect = answered && selected === quiz.correctIndex;

  const goTo = (id: string) => {
    setSelected(null);
    navigate(`/module/${module.id}/quiz/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between text-sm">
        <Link to={`/module/${module.id}`} className="text-term-dim hover:text-term-text">
          ← {module.id} {module.title}
        </Link>
        <span className="text-term-dim">
          question {quizIdx + 1} / {quizzes.length}
        </span>
      </div>

      <div className="rounded-lg border border-term-border bg-term-panel p-6">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-term-amber">
          concept quiz
          {solved && <span className="ml-2 text-term-green">✓ solved</span>}
        </div>
        <h1 className="text-lg font-bold leading-relaxed text-term-text">{quiz.question}</h1>

        <ul className="mt-5 space-y-3">
          {quiz.options.map((option, idx) => {
            const isThisCorrect = idx === quiz.correctIndex;
            const isThisSelected = idx === selected;

            let cls = 'border-term-border bg-black/30 hover:border-term-blue/60 hover:bg-term-border/30';
            if (answered) {
              if (isThisCorrect) {
                cls = 'border-term-green/70 bg-term-green/10';
              } else if (isThisSelected) {
                cls = 'border-term-red/70 bg-term-red/10';
              } else {
                cls = 'border-term-border bg-black/20 opacity-60';
              }
            }

            return (
              <li key={idx}>
                <button
                  onClick={() => onSelect(idx)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${cls} ${
                    answered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      answered && isThisCorrect
                        ? 'border-term-green text-term-green'
                        : answered && isThisSelected
                          ? 'border-term-red text-term-red'
                          : 'border-term-dim text-term-dim'
                    }`}
                  >
                    {OPTION_LABELS[idx]}
                  </span>
                  <span className="text-term-text">{option}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div
            className={`mt-5 rounded-lg border p-4 text-sm ${
              isCorrect
                ? 'border-term-green/50 bg-term-green/5 text-term-green'
                : 'border-term-red/50 bg-term-red/5 text-term-red'
            }`}
          >
            <div className="font-bold">{isCorrect ? 'Correct!' : 'Not quite.'}</div>
            <p className="mt-2 leading-relaxed text-term-dim">{quiz.explanation}</p>
            {!isCorrect && (
              <button
                onClick={() => setSelected(null)}
                className="mt-3 rounded border border-term-border px-3 py-1.5 text-xs text-term-text transition-colors hover:bg-term-border/40"
              >
                try again
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {prev && (
          <button
            onClick={() => goTo(prev.id)}
            className="rounded border border-term-border px-3 py-2 text-sm text-term-dim transition-colors hover:bg-term-border/40 hover:text-term-text"
          >
            ← previous
          </button>
        )}
        {next ? (
          <button
            onClick={() => goTo(next.id)}
            className={`rounded border px-3 py-2 text-sm transition-colors ${
              solved
                ? 'border-term-green/60 bg-term-green/10 text-term-green hover:bg-term-green/20'
                : 'border-term-border text-term-dim hover:bg-term-border/40 hover:text-term-text'
            }`}
          >
            next question →
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
