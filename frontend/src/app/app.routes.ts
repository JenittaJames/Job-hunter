import { Routes } from '@angular/router';
import { authGuard, nonAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [nonAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/jobs.component').then(m => m.JobsComponent)
      },
      {
        path: 'outreach',
        loadComponent: () => import('./features/outreach/outreach.component').then(m => m.OutreachComponent)
      },
      {
        path: 'networking',
        loadComponent: () => import('./features/networking/networking.component').then(m => m.NetworkingComponent)
      },
      {
        path: 'followups',
        loadComponent: () => import('./features/followups/followups.component').then(m => m.FollowupsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
