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

export interface Module {
  id: string; // e.g. "101.1"
  title: string;
  topicId: string; // e.g. "101"
  description: string;
  exercises: Exercise[];
}

export interface Topic {
  id: string;
  title: string;
}
