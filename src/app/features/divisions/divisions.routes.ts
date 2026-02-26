import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./divisions-page/divisions-page.component').then((m) => m.DivisionsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./divisions-id/divisions-id.component').then((m) => m.DivisionsIdComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./divisions-id/divisions-id.component').then((m) => m.DivisionsIdComponent),
  },
] as Routes;
