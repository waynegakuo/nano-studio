import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-maintenance',
  imports: [NgOptimizedImage],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceComponent {}
