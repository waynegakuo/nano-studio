import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap, tap } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import {HistoryPrompt, HistoryPromptBase, HistoryPromptId, NewHistoryPrompt} from '../../models/prompt.model';

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

  /**
   * Add a new prompt to the user's history.
   * @param prompt The prompt text to add.
   * @returns A promise that resolves with the ID of the newly added prompt.
   * @throws If the user is not authenticated.
   */
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

  /**
   * Get a specific prompt by ID.
   * @param id The ID of the prompt to retrieve.
   * @returns A promise that resolves with the prompt data or null if not found.
   */
  async getPrompt(id: HistoryPromptId): Promise<HistoryPrompt | null> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');

    const docRef = doc(this.fs, 'historyPrompts', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data() as unknown as HistoryPromptBase;
    // Ensure the current user owns the document
    if (data.userId !== userId) return null;

    return { id: snap.id, ...data } as HistoryPrompt;
  }

  /**
   * Update an existing prompt.
   * @param id The ID of the prompt to update.
   * @param updates The updates to apply to the prompt.
   * @returns A promise that resolves when the update is complete.
   * @throws If the user is not authenticated.
   */
  async updatePrompt(id: HistoryPromptId, updates: Partial<Pick<HistoryPromptBase, 'prompt'>>): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');
    const docRef = doc(this.fs, 'historyPrompts', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>);
  }

  /**
   * Delete a specific prompt by ID.
   * @param id The ID of the prompt to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws If the user is not authenticated.
   */
  async deletePrompt(id: HistoryPromptId): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');
    const docRef = doc(this.fs, 'historyPrompts', id);
    await deleteDoc(docRef);
  }

  /**
   * Clear all prompts for the current user.
   * @returns A promise that resolves when the deletion is complete.
   * @throws If the user is not authenticated.
   */
  async clearAll(): Promise<void> {}


  async clearAllForCurrentUser(): Promise<void> {
    const userId = this.auth.getUserId();
    if (!userId) throw new Error('Not authenticated');

    // Client-side batch delete of currently loaded prompts only
    const ids = this.prompts().map((p) => p.id);
    await Promise.all(ids.map((id) => this.deletePrompt(id)));
  }
}
