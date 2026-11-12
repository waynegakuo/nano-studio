import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Navbar } from './shared/navbar/navbar';
import { ToastComponent } from './shared/toast/toast';
import { RouterOutlet } from '@angular/router';
import { FestiveDecorations } from './shared/festive-decorations/festive-decorations';
import { ThemeService } from './services/theme/theme.service';


@Component({
  selector: 'app-root',
  imports: [Navbar, ToastComponent, RouterOutlet, FestiveDecorations],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class App {
  themeService = inject(ThemeService);
}
