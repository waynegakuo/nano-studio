import { ChangeDetectionStrategy, Component, signal, effect, afterNextRender, Injector } from '@angular/core';
import {NgOptimizedImage } from '@angular/common';
import { UserAuth } from '../user-auth/user-auth';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, UserAuth],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'navbar-host'
  }
})
export class Navbar {
  readonly whyOpen = signal(false);
  readonly festiveTheme = signal(false);

  constructor(private injector: Injector) {
    afterNextRender(() => {
      effect(() => {
        if (this.festiveTheme()) {
          document.body.classList.add('festive-theme');
        } else {
          document.body.classList.remove('festive-theme');
        }
      }, { injector: this.injector });
    });
  }

  toggleWhy(): void {
    this.whyOpen.update((v) => !v);
  }

  closeWhy(): void {
    if (this.whyOpen()) this.whyOpen.set(false);
  }

  toggleFestiveTheme(): void {
    this.festiveTheme.update((v) => !v);
  }
}
