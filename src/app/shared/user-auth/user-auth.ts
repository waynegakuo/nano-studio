import {ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AuthService} from '../../services/core/auth/auth.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-user-auth',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './user-auth.html',
  styleUrl: './user-auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'user-auth',
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class UserAuth implements OnDestroy {
  private auth = inject(AuthService);

  readonly menuOpen = signal<boolean>(false);

  // Local pending state for the Google popup sign-in
  readonly signingIn = signal<boolean>(false);

  // Expose auth service signals to the template
  readonly loading = computed(() => this.auth.isLoading());
  readonly isAuthed = computed(() => this.auth.isAuthenticated());

  // Reactive signals for user data
  readonly user = computed(() => this.auth.currentUser());
  readonly displayName = computed(() => this.auth.getUserDisplayName() ?? '');
  readonly photoUrl = computed(() => this.auth.getUserPhotoUrl());
  readonly initials = computed(() => this.computeInitials(this.displayName()));

  // Subject for managing subscriptions
  private destroy$ = new Subject<void>();


  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  /**
   * Handles clicks on the document to close the menu when clicking outside the component
   * @param event The click event on the document
   */
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    // Close if click is outside component host
    const hostEl = (event.currentTarget && (event as any).target) ? null : null; // placeholder to satisfy TS, not used
    // Walk up to find nearest user-auth root
    const closestAuth = target.closest('.user-auth');
    if (!closestAuth) {
      this.closeMenu();
    }
  }

  // JSDoc comment for the signIn method
  /**
   * Signs in with Google using a popup
   * @returns Promise that resolves with the user credentials
   */
  signIn(): void {
    if (this.signingIn()) return; // guard against double clicks
    this.signingIn.set(true);
    const sub = this.auth.signInWithGoogle()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
        },
        error: (err) => console.error('Sign-in failed', err)
      });
    // Ensure we always clear the pending state
    sub.add(() => this.signingIn.set(false));
  }

  /**
   * Signs out the current user
   * @returns Promise that resolves when sign out is complete
   */
  signOut(): void {
    this.auth.signOut()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeMenu();
        },
        error: (err) => console.error('Sign-out failed', err)
      });
  }

  /**
   * Computes initials from a display name
   * @param name The display name to compute initials from
   * @returns The computed initials
   */
  private computeInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  /**
   * Cleanup on component destruction
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
