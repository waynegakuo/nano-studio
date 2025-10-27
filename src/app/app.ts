import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Home } from './pages/home/home';
import { Navbar } from './shared/navbar/navbar';
import { ToastComponent } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [Navbar, Home, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('nano-studio');
}
