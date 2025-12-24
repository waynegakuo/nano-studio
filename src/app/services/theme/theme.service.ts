import { Injectable, signal, effect, afterNextRender, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly festiveTheme = signal(false);

  constructor(private injector: Injector) {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();
    // Show from Dec 1st to Jan 5th
    const isFestive = (month === 11 && day >= 1) || (month === 0 && day <= 5);
    this.festiveTheme.set(isFestive);

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
