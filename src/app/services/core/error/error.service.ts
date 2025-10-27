import { Injectable, signal } from '@angular/core';
import { AppErrorLevel, AppErrorMessage } from './error.types';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly _messages = signal<AppErrorMessage[]>([]);

  messages = this._messages.asReadonly();

  show(text: string, level: AppErrorLevel = 'error', timeoutMs: number = 6000): string {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const msg: AppErrorMessage = { id, text, level, timeoutMs };
    this._messages.update(list => [msg, ...list]);

    // SSR-safe timeout
    if (typeof window !== 'undefined' && typeof setTimeout !== 'undefined' && timeoutMs > 0) {
      setTimeout(() => this.dismiss(id), timeoutMs);
    }

    return id;
  }

  showInfo(text: string, timeoutMs: number = 4000) { return this.show(text, 'info', timeoutMs); }
  showWarning(text: string, timeoutMs: number = 6000) { return this.show(text, 'warning', timeoutMs); }
  showError(text: string, timeoutMs: number = 8000) { return this.show(text, 'error', timeoutMs); }

  dismiss(id: string): void {
    this._messages.update(list => list.filter(m => m.id !== id));
  }

  clearAll(): void {
    this._messages.set([]);
  }
}
