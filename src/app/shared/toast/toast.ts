import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ErrorService } from '../../services/core/error/error.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'toast-container',
    role: 'region',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  },
  standalone: true,
})
export class ToastComponent {
  private readonly errorService = inject(ErrorService);

  readonly messages = this.errorService.messages;

  // Derived state for CSS classes
  levelClass = (level: 'info' | 'warning' | 'error') => {
    switch (level) {
      case 'info': return 'toast--info';
      case 'warning': return 'toast--warning';
      default: return 'toast--error';
    }
  };

  dismiss(id: string) {
    this.errorService.dismiss(id);
  }
}
