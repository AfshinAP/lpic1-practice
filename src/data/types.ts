export interface Exercise {
  id: string;
  title: string;
  description: string;
  /** Lines printed in the terminal before the prompt (scenario context). */
  context?: string[];
  /** Accepted command answers (whitespace-normalized exact match). */
  acceptedAnswers: string[];
  hintAfterAttempts?: number;
  hint: string;
  successOutput: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  /** Exactly four answer choices. */
  options: [string, string, string, string];
  /** Index (0-3) of the correct option. */
  correctIndex: 0 | 1 | 2 | 3;
  /** Shown after the user answers, explaining the correct choice. */
  explanation: string;
}

export interface Module {
  id: string; // e.g. "101.1"
  title: string;
  topicId: string; // e.g. "101"
  description: string;
  exercises: Exercise[];
  /** Concept multiple-choice questions for non-command topics. */
  quizzes?: QuizQuestion[];
}

export interface Topic {
  id: string;
  title: string;
}

export interface ChallengeStep {
  id: string;
  title: string;
  description: string;
  /** Lines printed in the terminal when this step begins. */
  context?: string[];
  acceptedAnswers: string[];
  hint: string;
  hintAfterAttempts?: number;
  successOutput: string;
}

export interface Challenge {
  id: string;       // e.g. "challenge-102"
  topicId: string;  // e.g. "102"
  title: string;    // "Incident: dpkg is broken"
  scenario: string; // narrative shown in the side panel
  /** Lines printed at the start of the challenge terminal. */
  intro?: string[];
  steps: ChallengeStep[];
}
