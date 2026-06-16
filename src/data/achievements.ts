import { modules, topics, totalExercises, getModulesByTopic } from './modules';
import { challenges } from './challenges';

export interface ProgressSnapshot {
  completedExercises: Set<string>;
  hintsUsed: Set<string>; // exercise ids where a hint was revealed
  completedChallengeSteps: Set<string>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: (p: ProgressSnapshot) => boolean;
}

function moduleComplete(moduleId: string, p: ProgressSnapshot): boolean {
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) return false;
  const exercisesDone = mod.exercises.every((e) => p.completedExercises.has(e.id));
  const quizzesDone = (mod.quizzes ?? []).every((q) => p.completedExercises.has(q.id));
  return exercisesDone && quizzesDone;
}

function topicComplete(topicId: string, p: ProgressSnapshot): boolean {
  return getModulesByTopic(topicId).every((m) => moduleComplete(m.id, p));
}

export const achievements: Achievement[] = [
  {
    id: 'first-command',
    title: 'First Command',
    description: 'Complete your first exercise.',
    icon: '>_',
    isUnlocked: (p) => p.completedExercises.size >= 1,
  },
  {
    id: 'half-way',
    title: 'Half Way There',
    description: 'Complete 50% of all exercises.',
    icon: '50%',
    isUnlocked: (p) => p.completedExercises.size >= Math.ceil(totalExercises / 2),
  },
  {
    id: 'lpic1-ready',
    title: 'LPIC-1 Ready',
    description: 'Complete every module from 101.1 to 110.3.',
    icon: 'TUX',
    isUnlocked: (p) => modules.every((m) => moduleComplete(m.id, p)),
  },
  {
    id: 'no-hints',
    title: 'No Hints Needed',
    description: 'Finish an entire module without revealing a single hint.',
    icon: 'PRO',
    isUnlocked: (p) =>
      modules.some(
        (m) =>
          moduleComplete(m.id, p) && m.exercises.every((e) => !p.hintsUsed.has(e.id)),
      ),
  },
  // Module Master badges (one per module)
  ...modules.map(
    (m): Achievement => ({
      id: `module-${m.id}`,
      title: `Module Master ${m.id}`,
      description: `Complete all exercises in ${m.id} ${m.title}.`,
      icon: m.id,
      isUnlocked: (p) => moduleComplete(m.id, p),
    }),
  ),
  // Topic Champion badges (one per topic)
  ...topics.map(
    (t): Achievement => ({
      id: `topic-${t.id}`,
      title: `Topic Champion ${t.id}`,
      description: `Complete every module in topic ${t.id} (${t.title}).`,
      icon: `#${t.id}`,
      isUnlocked: (p) => topicComplete(t.id, p),
    }),
  ),
  // Incident Resolved badges (one per topic challenge)
  ...challenges.map(
    (c): Achievement => ({
      id: `challenge-${c.topicId}`,
      title: `Incident Resolved ${c.topicId}`,
      description: `Complete the topic ${c.topicId} scenario challenge: "${c.title}".`,
      icon: `!${c.topicId}`,
      isUnlocked: (p) =>
        c.steps.every((s) => p.completedChallengeSteps.has(s.id)),
    }),
  ),
  // Grand badge for clearing every challenge
  {
    id: 'incident-responder',
    title: 'Incident Responder',
    description: 'Resolve every topic challenge scenario from 101 to 110.',
    icon: 'SRE',
    isUnlocked: (p) =>
      challenges.every((c) => c.steps.every((s) => p.completedChallengeSteps.has(s.id))),
  },
];

export function getUnlockedAchievements(p: ProgressSnapshot): Achievement[] {
  return achievements.filter((a) => a.isUnlocked(p));
}
