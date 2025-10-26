import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {UserAuth} from '../user-auth/user-auth';

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

  toggleWhy(): void {
    this.whyOpen.update((v) => !v);
  }

  closeWhy(): void {
    if (this.whyOpen()) this.whyOpen.set(false);
  }
}
