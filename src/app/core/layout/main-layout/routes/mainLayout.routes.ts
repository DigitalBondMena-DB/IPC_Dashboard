import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
] as Routes;
