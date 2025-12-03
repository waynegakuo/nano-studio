import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-maintenance',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceComponent {}
