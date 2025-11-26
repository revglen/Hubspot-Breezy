import { Routes } from '@angular/router';
import { MainDashboard } from './main-dashboard/main-dashboard';

export const routes: Routes = [
    { path: '', component: MainDashboard },
    { path: '**', redirectTo: '' }
];
