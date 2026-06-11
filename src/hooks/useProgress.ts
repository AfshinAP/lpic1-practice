import { useCallback, useSyncExternalStore } from 'react';
import { achievements, type Achievement, type ProgressSnapshot } from '../data/achievements';

const STORAGE_KEY = 'lpic-practice-progress-v1';

interface StoredProgress {
  completedExercises: string[];
  hintsUsed: string[];
  unlockedAchievements: string[];
}

interface ProgressState {
  completedExercises: Set<string>;
  hintsUsed: Set<string>;
  unlockedAchievements: Set<string>;
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredProgress = JSON.parse(raw);
      return {
        completedExercises: new Set(parsed.completedExercises ?? []),
        hintsUsed: new Set(parsed.hintsUsed ?? []),
        unlockedAchievements: new Set(parsed.unlockedAchievements ?? []),
      };
    }
  } catch {
    // corrupted storage — start fresh
  }
  return {
    completedExercises: new Set(),
    hintsUsed: new Set(),
    unlockedAchievements: new Set(),
  };
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function persist() {
  const stored: StoredProgress = {
    completedExercises: [...state.completedExercises],
    hintsUsed: [...state.hintsUsed],
    unlockedAchievements: [...state.unlockedAchievements],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressState {
  return state;
}

/** Marks an exercise complete; returns achievements newly unlocked by this action. */
export function completeExercise(exerciseId: string): Achievement[] {
  if (state.completedExercises.has(exerciseId)) return [];
  const completedExercises = new Set(state.completedExercises).add(exerciseId);
  const snapshot: ProgressSnapshot = {
    completedExercises,
    hintsUsed: state.hintsUsed,
  };
  const newlyUnlocked = achievements.filter(
    (a) => !state.unlockedAchievements.has(a.id) && a.isUnlocked(snapshot),
  );
  state = {
    ...state,
    completedExercises,
    unlockedAchievements: new Set([
      ...state.unlockedAchievements,
      ...newlyUnlocked.map((a) => a.id),
    ]),
  };
  emit();
  return newlyUnlocked;
}

export function markHintUsed(exerciseId: string) {
  if (state.hintsUsed.has(exerciseId)) return;
  state = { ...state, hintsUsed: new Set(state.hintsUsed).add(exerciseId) };
  emit();
}

export function resetProgress() {
  state = {
    completedExercises: new Set(),
    hintsUsed: new Set(),
    unlockedAchievements: new Set(),
  };
  emit();
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot);

  const isExerciseComplete = useCallback(
    (id: string) => progress.completedExercises.has(id),
    [progress],
  );

  const isAchievementUnlocked = useCallback(
    (id: string) => progress.unlockedAchievements.has(id),
    [progress],
  );

  return {
    completedExercises: progress.completedExercises,
    hintsUsed: progress.hintsUsed,
    unlockedAchievements: progress.unlockedAchievements,
    isExerciseComplete,
    isAchievementUnlocked,
    completeExercise,
    markHintUsed,
    resetProgress,
  };
}
