import { useEffect, useRef, useState } from 'react';
import type { Exercise } from '../data/types';

const PROMPT = 'user@lpic:~$';

interface TermLine {
  kind: 'input' | 'output' | 'error' | 'success' | 'info' | 'context';
  text: string;
}

interface TerminalProps {
  exercise: Exercise;
  solved: boolean;
  onSolved: () => void;
  onHintUsed: () => void;
}

/** Normalize a command: trim, collapse whitespace. */
function normalize(cmd: string): string {
  return cmd.trim().replace(/\s+/g, ' ');
}

function matches(input: string, exercise: Exercise): boolean {
  let n = normalize(input);
  // sudo prefix is accepted everywhere unless the answer itself requires it
  const stripped = n.replace(/^sudo /, '');
  return exercise.acceptedAnswers.some((a) => {
    const ans = normalize(a);
    return n === ans || stripped === ans;
  });
}

const WRONG_RESPONSES = [
  'bash: task not satisfied — that command does not accomplish the goal. Try again.',
  'bash: not quite. Re-read the task and try another command.',
  'bash: nope — the grader expected something else. Try again.',
];

export default function Terminal({ exercise, solved, onSolved, onHintUsed }: TerminalProps) {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hintThreshold = exercise.hintAfterAttempts ?? 3;

  // Reset terminal state when the exercise changes
  useEffect(() => {
    const initial: TermLine[] = [
      { kind: 'info', text: `Welcome to the LPIC practice shell. Task: ${exercise.title}` },
      { kind: 'info', text: 'Type "help" for terminal commands.' },
    ];
    if (exercise.context) {
      initial.push(...exercise.context.map((c): TermLine => ({ kind: 'context', text: c })));
    }
    setLines(initial);
    setInput('');
    setAttempts(0);
    setHintShown(false);
    setHistoryIdx(-1);
  }, [exercise]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function push(...newLines: TermLine[]) {
    setLines((prev) => [...prev, ...newLines]);
  }

  function revealHint() {
    if (!hintShown) {
      setHintShown(true);
      onHintUsed();
    }
    push({ kind: 'info', text: `hint: ${exercise.hint}` });
  }

  function run(raw: string) {
    const cmd = normalize(raw);
    push({ kind: 'input', text: raw });
    if (cmd) {
      setHistory((prev) => [...prev, raw]);
    }
    setHistoryIdx(-1);
    setInput('');

    if (!cmd) return;

    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    if (cmd === 'help') {
      push(
        { kind: 'info', text: 'Practice shell commands:' },
        { kind: 'info', text: '  help   show this help' },
        { kind: 'info', text: '  hint   reveal a hint (counts against "No Hints Needed")' },
        { kind: 'info', text: '  clear  clear the screen' },
        { kind: 'info', text: 'Anything else is checked against the task.' },
      );
      return;
    }
    if (cmd === 'hint') {
      revealHint();
      return;
    }

    if (solved) {
      push({ kind: 'info', text: 'Task already solved — move on to the next exercise!' });
      return;
    }

    if (matches(raw, exercise)) {
      push(
        ...exercise.successOutput.split('\n').map((t): TermLine => ({ kind: 'output', text: t })),
        { kind: 'success', text: 'Correct! Exercise completed.' },
      );
      onSolved();
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      push({
        kind: 'error',
        text: WRONG_RESPONSES[nextAttempts % WRONG_RESPONSES.length],
      });
      if (nextAttempts >= hintThreshold && !hintShown) {
        push({
          kind: 'info',
          text: `Struggling? Type "hint" to reveal a hint. (${nextAttempts} attempts)`,
        });
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      run(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const idx = historyIdx + 1;
      if (idx >= history.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    }
  }

  const lineColor: Record<TermLine['kind'], string> = {
    input: 'text-term-text',
    output: 'text-term-dim',
    error: 'text-term-red',
    success: 'text-term-green font-bold',
    info: 'text-term-amber',
    context: 'text-term-blue',
  };

  return (
    <div
      className="flex h-full min-h-[24rem] flex-col rounded-lg border border-term-border bg-black/60 shadow-xl"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 rounded-t-lg border-b border-term-border bg-term-panel px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-term-red/80" />
        <span className="h-3 w-3 rounded-full bg-term-amber/80" />
        <span className="h-3 w-3 rounded-full bg-term-green/80" />
        <span className="ml-2 text-xs text-term-dim">user@lpic — practice shell</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 text-sm leading-6">
        {lines.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all ${lineColor[line.kind]}`}>
            {line.kind === 'input' ? (
              <>
                <span className="text-term-green">{PROMPT}</span> {line.text}
              </>
            ) : (
              line.text
            )}
          </div>
        ))}

        <div className="flex items-center">
          <span className="shrink-0 text-term-green">{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="ml-2 w-full bg-transparent text-term-text caret-term-green outline-none"
            aria-label="terminal input"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-b-lg border-t border-term-border bg-term-panel px-4 py-2 text-xs text-term-dim">
        <span>
          attempts: <span className="text-term-text">{attempts}</span>
          {hintShown && <span className="ml-3 text-term-amber">hint revealed</span>}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            revealHint();
          }}
          className="rounded border border-term-border px-2 py-1 text-term-amber transition-colors hover:bg-term-border/40"
        >
          show hint
        </button>
      </div>
    </div>
  );
}
