import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./authority-hospitals-page/authority-hospitals-page.component').then(
        (m) => m.AuthorityHospitalsPageComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./authority-hospitals-id/authority-hospitals-id.component').then(
        (m) => m.AuthorityHospitalsIdComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./authority-hospitals-id/authority-hospitals-id.component').then(
        (m) => m.AuthorityHospitalsIdComponent,
      ),
  },
] as Routes;
