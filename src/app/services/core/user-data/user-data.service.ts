import {DestroyRef, effect, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {doc, docData, DocumentReference, Firestore, setDoc, updateDoc} from '@angular/fire/firestore';
import {AuthService} from '../auth/auth.service';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {User} from '@angular/fire/auth';
import {UserData} from '../../../models/user-data.model';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef); // Inject DestroyRef
  private platformId = inject(PLATFORM_ID);

  userData = signal<UserData | null>(null);
  generations = signal<number>(0);

  constructor() {
    toObservable(this.authService.currentUser).pipe(
      switchMap(user => {
        if (user) {
          // If user is not null, fetch their data
          return this.getUserData(user.uid);
        } else {
          // If user is null, emit null userData
          return of(null);
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(userData => {
      // userData will be UserDataService | null, which is assignable to signal<UserDataService | null>
      this.userData.set(userData);
    });

    // This effect will reactively update the `generations` signal whenever
    // the user logs in/out or their data changes.
    effect(() => {
      const user = this.authService.currentUser();
      const userData = this.userData();
      const today = new Date().toDateString();

      if (user && !user.isAnonymous) { // Authenticated user
        const usedToday = (userData?.lastGenerationDate === today) ? (userData.imageGenerations || 0) : 0;
        this.generations.set(usedToday);
      } else { // Anonymous or logged-out user
        // We need to read from localStorage for guests
        this.updateGuestGenerationsFromStorage();
      }
    });
  }

  /**
   * Fetch user data from Firestore based on the provided user ID.
   * Returns an Observable that emits the user data or null if the user is not found.
   * @param uid The user ID to fetch data for.
   * @returns An Observable that emits the user data or null.
   */
  private getUserData(uid: string): Observable<UserData | null> {
    const userDocRef = doc(this.firestore, `users/${uid}`) as DocumentReference<UserData>;
    return docData<UserData>(userDocRef).pipe(
      map(userData => userData === undefined ? null : userData), // Explicitly map undefined to null
      catchError(error => {
        console.error("Error fetching user data:", error);
        return of(null);
      })
    );
  }

  /**
   * Update user data in Firestore for the given user.
   * @param user The user object containing updated data.
   * @returns A Promise that resolves when the update is complete.
   */
  async updateUserData(user: User): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    await setDoc(userDocRef, userData, { merge: true });
  }

  /**
   * Check if the user can generate an image.
   * @param user The user object to check.
   * @returns True if the user can generate an image, false otherwise.
   */
  canGenerateImage(user: User | null): boolean {
    if (!user) { // Anonymous user
      const guestGenerations = parseInt(localStorage.getItem('guestGenerations') || '0', 10);
      const lastGuestGenerationDate = localStorage.getItem('lastGuestGenerationDate');
      const today = new Date().toDateString();

      if (lastGuestGenerationDate !== today) {
        localStorage.setItem('guestGenerations', '0');
        return true;
      }

      return guestGenerations < 2;
    }

    const userData = this.userData();
    if (!userData) {
      return false;
    }

    const today = new Date().toDateString();
    const quota = user.isAnonymous ? 2 : 10;

    if (userData.lastGenerationDate !== today) {
      this.resetImageGenerations(user.uid);
      return true;
    }

    return (userData.imageGenerations || 0) < quota;
  }

  /**
   * Increment the image generations count for the given user.
   * @param user The user object to increment the count for.
   * @returns A Promise that resolves when the update is complete.
   */
  incrementImageGenerations(user: User | null): void {
    if (!user) { // Anonymous user
      const today = new Date().toDateString();
      let guestGenerations = parseInt(localStorage.getItem('guestGenerations') || '0', 10);
      guestGenerations++;
      localStorage.setItem('guestGenerations', guestGenerations.toString());
      localStorage.setItem('lastGuestGenerationDate', today);
      this.generations.set(guestGenerations); // Update the reactive signal
      return;
    }

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const userData = this.userData();
    const today = new Date().toDateString();
    const currentGenerations = (userData?.lastGenerationDate === today) ? (userData.imageGenerations || 0) : 0;

    const newCount = currentGenerations + 1;
    this.generations.set(newCount); // Optimistically update the signal

    updateDoc(userDocRef, {
      imageGenerations: newCount,
      lastGenerationDate: new Date().toDateString()
    });
  }

  /**
   * Reset the image generations count for the given user.
   * @param uid The user ID to reset the count for.
   * @returns A Promise that resolves when the update is complete.
   */
  private resetImageGenerations(uid: string): void {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    updateDoc(userDocRef, {
      imageGenerations: 0,
      lastGenerationDate: new Date().toDateString()
    });
  }

  /**
   * Reads from localStorage to update the generations signal for guest users.
   * This is called by the effect to initialize and sync the count.
   */
  private updateGuestGenerationsFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const lastDate = localStorage.getItem('lastGuestGenerationDate');
    const today = new Date().toDateString();

    const usedToday = (lastDate === today) ? parseInt(localStorage.getItem('guestGenerations') || '0', 10) : 0;
    this.generations.set(usedToday);
  }
}
