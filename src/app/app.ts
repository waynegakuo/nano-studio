import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navbar } from './shared/navbar/navbar';
import { ToastComponent } from './shared/toast/toast';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Navbar, ToastComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
