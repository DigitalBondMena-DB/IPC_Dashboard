import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./hospitals-page/hospitals-page.component').then((m) => m.HospitalsPageComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./hospitals-id/hospitals-id.component').then((m) => m.HospitalsIdComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./hospitals-id/hospitals-id.component').then((m) => m.HospitalsIdComponent),
  },
] as Routes;
