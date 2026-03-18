import { Routes } from '@angular/router';
import { ReportsLayoutComponent } from './layout/reports-layout.component';

export default [
  {
    path: '',
    component: ReportsLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('@features/reports/pages/overview/overview.component').then(
            (m) => m.OverviewComponent,
          ),
      },
      // Other pages will be added here
    ],
  },
] as Routes;
