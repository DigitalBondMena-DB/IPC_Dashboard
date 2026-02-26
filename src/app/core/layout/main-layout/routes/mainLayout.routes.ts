import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/home/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'divisions',
    loadChildren: () => import('@features/divisions/divisions.routes'),
  },
  {
    path: 'health-directorate',
    loadChildren: () => import('@features/health-directorate/health-directorate.routes'),
  },
  {
    path: 'health-division',
    loadChildren: () => import('@features/health-division/health-division.routes'),
  },
  {
    path: 'hospitals',
    loadChildren: () => import('@features/hospitals/hospitals.routes'),
  },
  {
    path: 'authorities',
    loadChildren: () => import('@features/authorities/authorities.routes'),
  },
  {
    path: 'authorities-hospitals',
    loadChildren: () => import('@features/authority-hospitals/authority-hospitals.routes'),
  },
  {
    path: '',
    loadChildren: () => import('@features/user-management/user-management.routes'),
  },
] as Routes;
