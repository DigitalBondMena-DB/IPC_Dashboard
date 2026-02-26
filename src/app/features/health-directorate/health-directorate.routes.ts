import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./health-directorate-page/health-directorate-page.component').then(
        (m) => m.HealthDirectoratePageComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./health-directorate-id/health-directorate-id.component').then(
        (m) => m.HealthDirectorateIdComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./health-directorate-id/health-directorate-id.component').then(
        (m) => m.HealthDirectorateIdComponent,
      ),
  },
] as Routes;
