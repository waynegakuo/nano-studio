import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { UserAuth } from '../user-auth/user-auth';
import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, NgOptimizedImage, UserAuth],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'navbar-host',
    '(document:click)': 'onDocumentClick($event)'
  },
  standalone: true,
})
export class Navbar {
  readonly whyOpen = signal(false);
  themeService = inject(ThemeService);
  private readonly elRef = inject(ElementRef);

  toggleWhy(): void {
    this.whyOpen.update((v: boolean) => !v);
  }

  closeWhy(): void {
    if (this.whyOpen()) this.whyOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    if (this.whyOpen() && !this.elRef.nativeElement.querySelector('.why-menu')?.contains(event.target as Node)) {
      this.whyOpen.set(false);
    }
  }

  toggleFestiveTheme(): void {
    this.themeService.toggleFestiveTheme();
  }
}
