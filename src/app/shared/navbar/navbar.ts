import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
    class: 'navbar-host'
  },
  standalone: true,
})
export class Navbar {
  readonly whyOpen = signal(false);
  themeService = inject(ThemeService);

  toggleWhy(): void {
    this.whyOpen.update((v: boolean) => !v);
  }

  closeWhy(): void {
    if (this.whyOpen()) this.whyOpen.set(false);
  }

  toggleFestiveTheme(): void {
    this.themeService.toggleFestiveTheme();
  }
}
