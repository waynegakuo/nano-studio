import {serverTimestamp, Timestamp} from '@angular/fire/firestore';

export interface PromptHistoryItem {
  prompt: string;
  timestamp: number;
  resultUrl?: string;
}

export interface HistoryPromptBase {
  userId: string;
  prompt: string;
  // When created on the client we submit serverTimestamp(); when reading it's a Timestamp
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type HistoryPromptId = string;

export type NewHistoryPrompt = Omit<HistoryPromptBase, 'createdAt' | 'updatedAt'> & {
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

export type HistoryPrompt = HistoryPromptBase & { id: HistoryPromptId };
