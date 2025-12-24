import { Injectable, signal, effect, afterNextRender, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly festiveTheme = signal(true);

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

  toggleFestiveTheme(): void {
    this.festiveTheme.update((v: boolean) => !v);
  }
}
