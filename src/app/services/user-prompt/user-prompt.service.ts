import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap, tap } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

export type HistoryPromptId = string;

export interface HistoryPromptBase {
  userId: string;
  prompt: string;
  // When created on the client we submit serverTimestamp(); when reading it's a Timestamp
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type NewHistoryPrompt = Omit<HistoryPromptBase, 'createdAt' | 'updatedAt'> & {
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

export type HistoryPrompt = HistoryPromptBase & { id: HistoryPromptId };

@Injectable({
  providedIn: 'root'
})
export class UserPromptService {
  private readonly fs = inject(Firestore);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly prompts = signal<HistoryPrompt[]>([]);
  readonly count = computed(() => this.prompts().length);

  private readonly collectionRef = collection(this.fs, 'historyPrompts');

  constructor() {
    // React to auth changes and subscribe to the user's prompt history in real-time
    toObservable(this.auth.currentUser)
      .pipe(
        switchMap((user) => {
          if (!user) {
            this.loading.set(false);
            this.prompts.set([]);
            return of<HistoryPrompt[]>([]);
          }
          this.loading.set(true);
          const q = query(
            this.collectionRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          return collectionData(q, { idField: 'id' }) as unknown as ReturnType<
            typeof of<HistoryPrompt[]>
          >;
        }),
        tap({
          next: (items) => {
            // items already include id via idField
            this.prompts.set(items as HistoryPrompt[]);
            this.loading.set(false);
            this.error.set(null);
          },
          error: (err) => {
            console.error('Failed to load history prompts:', err);
            this.error.set(err?.message ?? 'Unknown error');
            this.loading.set(false);
          },
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  async addPrompt(prompt: string): Promise<HistoryPromptId> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');

    const data: NewHistoryPrompt = {
      userId,
      prompt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(this.collectionRef, data as unknown as Record<string, unknown>);
    return ref.id;
  }

  async updatePrompt(id: HistoryPromptId, updates: Partial<Pick<HistoryPromptBase, 'prompt'>>): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');
    const docRef = doc(this.fs, 'historyPrompts', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>);
  }

  async deletePrompt(id: HistoryPromptId): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');
    const docRef = doc(this.fs, 'historyPrompts', id);
    await deleteDoc(docRef);
  }

  async clearAllForCurrentUser(): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');

    // Client-side batch delete of currently loaded prompts only
    const ids = this.prompts().map((p) => p.id);
    await Promise.all(ids.map((id) => this.deletePrompt(id)));
  }
}
