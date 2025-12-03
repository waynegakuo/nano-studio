import { Routes } from '@angular/router';
import { MaintenanceComponent } from './pages/maintenance/maintenance';
import {Home} from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: MaintenanceComponent
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
