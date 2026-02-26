import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./health-division-page/health-division-page.component').then(
        (m) => m.HealthDivisionPageComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./health-division-id/health-division-id.component').then(
        (m) => m.HealthDivisionIdComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./health-division-id/health-division-id.component').then(
        (m) => m.HealthDivisionIdComponent,
      ),
  },
] as Routes;
