import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./authorities-page/authorities-page.component').then(
        (m) => m.AuthoritiesPageComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./authorities-id/authorities-id.component').then((m) => m.AuthoritiesIdComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./authorities-id/authorities-id.component').then((m) => m.AuthoritiesIdComponent),
  },
] as Routes;
