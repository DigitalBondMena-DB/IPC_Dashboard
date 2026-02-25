import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/home/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
] as Routes;
