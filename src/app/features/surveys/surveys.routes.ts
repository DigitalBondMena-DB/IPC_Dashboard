import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/surveys/surveys-list/surveys-list.component').then(
        (m) => m.SurveysListComponent,
      ),
  },
] as Routes;
