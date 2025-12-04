import { Routes } from '@angular/router';
import { MaintenanceComponent } from './pages/maintenance/maintenance';
import {Home} from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
