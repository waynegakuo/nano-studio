import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  HostListener
} from '@angular/core';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
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
  }
})
export class UserAuth implements OnDestroy {
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      const target = event.target as HTMLElement | null;
      if (target && !this.elementRef.nativeElement.contains(target)) {
        this.closeMenu();
      }
    }
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  signIn(): void {
    if (this.signingIn()) return; // guard against double clicks
    this.signingIn.set(true);
    const sub = this.auth.signInWithGoogle()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        error: (err) => console.error('Sign-in failed', err)
      });
    sub.add(() => this.signingIn.set(false));
  }

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

  private computeInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
