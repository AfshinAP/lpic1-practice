import { useEffect, useRef, useState } from 'react';
import type { Challenge, ChallengeStep } from '../data/types';
import type { Achievement } from '../data/achievements';

const PROMPT = 'user@lpic:~$';

interface TermLine {
  kind: 'input' | 'output' | 'error' | 'success' | 'info' | 'context' | 'step';
  text: string;
}

interface ChallengeTerminalProps {
  challenge: Challenge;
  initialStepIndex: number;
  onStepSolved: (stepId: string) => Achievement[];
  onChallengeComplete: () => void;
}

function normalize(cmd: string): string {
  return cmd.trim().replace(/\s+/g, ' ');
}

function matchesStep(input: string, step: ChallengeStep): boolean {
  const n = normalize(input);
  const stripped = n.replace(/^sudo /, '');
  return step.acceptedAnswers.some((a) => {
    const ans = normalize(a);
    return n === ans || stripped === ans;
  });
}

const WRONG_RESPONSES = [
  'bash: command does not satisfy the task objective — try again.',
  'bash: not quite. Re-read the task description and try another approach.',
  'bash: nope — that is not the expected command here. Try again.',
];

export default function ChallengeTerminal({
  challenge,
  initialStepIndex,
  onStepSolved,
  onChallengeComplete,
}: ChallengeTerminalProps) {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [attempts, setAttempts] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentStep: ChallengeStep | undefined = challenge.steps[currentStepIndex];
  const hintThreshold = currentStep?.hintAfterAttempts ?? 3;

  // Initialize terminal on mount
  useEffect(() => {
    const initial: TermLine[] = [];

    if (challenge.intro) {
      initial.push(...challenge.intro.map((t): TermLine => ({ kind: 'info', text: t })));
    }

    if (initialStepIndex > 0) {
      initial.push({
        kind: 'info',
        text: `Resuming from step ${initialStepIndex + 1} of ${challenge.steps.length}...`,
      });
    }

    if (currentStep) {
      initial.push(...stepHeader(currentStep, initialStepIndex, challenge.steps.length));
    }

    setLines(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function stepHeader(step: ChallengeStep, idx: number, total: number): TermLine[] {
    const header: TermLine[] = [
      { kind: 'step', text: `── Step ${idx + 1}/${total}: ${step.title} ──` },
    ];
    if (step.context) {
      header.push(...step.context.map((c): TermLine => ({ kind: 'context', text: c })));
    }
    return header;
  }

  function push(...newLines: TermLine[]) {
    setLines((prev) => [...prev, ...newLines]);
  }

  function revealHint() {
    if (!currentStep) return;
    if (!hintShown) {
      setHintShown(true);
    }
    push({ kind: 'info', text: `hint: ${currentStep.hint}` });
  }

  function run(raw: string) {
    const cmd = normalize(raw);
    push({ kind: 'input', text: raw });
    if (cmd) setHistory((prev) => [...prev, raw]);
    setHistoryIdx(-1);
    setInput('');

    if (!cmd) return;

    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    if (cmd === 'help') {
      push(
        { kind: 'info', text: 'Challenge shell commands:' },
        { kind: 'info', text: '  help   show this help' },
        { kind: 'info', text: '  hint   reveal a hint for the current step' },
        { kind: 'info', text: '  clear  clear the screen' },
        { kind: 'info', text: 'Anything else is checked against the current step objective.' },
      );
      return;
    }
    if (cmd === 'hint') {
      revealHint();
      return;
    }

    if (finished || !currentStep) {
      push({ kind: 'info', text: 'Incident already resolved — well done!' });
      return;
    }

    if (matchesStep(raw, currentStep)) {
      push(
        ...currentStep.successOutput.split('\n').map((t): TermLine => ({ kind: 'output', text: t })),
        { kind: 'success', text: `✓ Step ${currentStepIndex + 1} complete.` },
      );

      onStepSolved(currentStep.id);

      const nextIdx = currentStepIndex + 1;

      if (nextIdx >= challenge.steps.length) {
        push(
          { kind: 'success', text: '' },
          { kind: 'success', text: '══════════════════════════════════════' },
          { kind: 'success', text: '  INCIDENT RESOLVED — all steps done! ' },
          { kind: 'success', text: '══════════════════════════════════════' },
        );
        setFinished(true);
        onChallengeComplete();
      } else {
        const nextStep = challenge.steps[nextIdx];
        push(...stepHeader(nextStep, nextIdx, challenge.steps.length));
        setCurrentStepIndex(nextIdx);
        setAttempts(0);
        setHintShown(false);
      }
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
          text: `Struggling? Type "hint" to get a clue. (${nextAttempts} attempts)`,
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
    step: 'text-term-blue font-bold mt-2',
  };

  const completedSteps = challenge.steps.filter((_, i) => i < currentStepIndex).length;
  const totalSteps = challenge.steps.length;

  return (
    <div
      className="flex h-full min-h-[28rem] flex-col rounded-lg border border-term-border bg-black/60 shadow-xl"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 rounded-t-lg border-b border-term-border bg-term-panel px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-term-red/80" />
        <span className="h-3 w-3 rounded-full bg-term-amber/80" />
        <span className="h-3 w-3 rounded-full bg-term-green/80" />
        <span className="ml-2 text-xs text-term-dim">user@lpic — challenge shell</span>
        <span className="ml-auto text-xs text-term-amber">
          {finished ? 'RESOLVED' : `step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
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

        {!finished && (
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
              aria-label="challenge terminal input"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-b-lg border-t border-term-border bg-term-panel px-4 py-2 text-xs text-term-dim">
        <div className="flex items-center gap-4">
          <span>
            attempts: <span className="text-term-text">{attempts}</span>
            {hintShown && <span className="ml-3 text-term-amber">hint revealed</span>}
          </span>
          <span>
            progress:{' '}
            <span className="text-term-green">{finished ? totalSteps : completedSteps}</span>
            <span className="text-term-dim">/{totalSteps} steps</span>
          </span>
        </div>
        {!finished && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              revealHint();
            }}
            className="rounded border border-term-border px-2 py-1 text-term-amber transition-colors hover:bg-term-border/40"
          >
            show hint
          </button>
        )}
      </div>
    </div>
  );
}
