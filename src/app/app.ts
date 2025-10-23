import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Home } from './pages/home/home';
import { Navbar } from './shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [Navbar, Home],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('nano-studio');
}
