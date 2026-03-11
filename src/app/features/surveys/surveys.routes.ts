import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('@features/surveys/surveys-list/surveys-list.component').then(
        (m) => m.SurveysListComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('@features/surveys/survey-create/survey-create.component').then(
        (m) => m.SurveyCreateComponent,
      ),
    children: [
      { path: '', redirectTo: 'setup', pathMatch: 'full' },
      {
        path: 'setup',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/survey-setup/survey-setup.component').then(
            (m) => m.SurveySetupComponent,
          ),
      },
      {
        path: 'preliminary-questions',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/preliminary-questions/preliminary-questions.component').then(
            (m) => m.PreliminaryQuestionsComponent,
          ),
      },
      {
        path: 'structure',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/survey-structure/survey-structure.component').then(
            (m) => m.SurveyStructureComponent,
          ),
      },
      {
        path: 'conditional-logic',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/conditional-logic/conditional-logic.component').then(
            (m) => m.ConditionalLogicComponent,
          ),
      },
    ],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('@features/surveys/survey-create/survey-create.component').then(
        (m) => m.SurveyCreateComponent,
      ),
    children: [
      { path: '', redirectTo: 'setup', pathMatch: 'full' },
      {
        path: 'setup',
        loadComponent: () =>
          import('./survey-create/components/survey-setup/survey-setup.component').then(
            (m) => m.SurveySetupComponent,
          ),
      },
      {
        path: 'preliminary-questions',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/preliminary-questions/preliminary-questions.component').then(
            (m) => m.PreliminaryQuestionsComponent,
          ),
      },
      {
        path: 'structure',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/survey-structure/survey-structure.component').then(
            (m) => m.SurveyStructureComponent,
          ),
      },
      {
        path: 'conditional-logic',
        loadComponent: () =>
          import('@features/surveys/survey-create/components/conditional-logic/conditional-logic.component').then(
            (m) => m.ConditionalLogicComponent,
          ),
      },
    ],
  },
  {
    path: 'conditional-logic',
    loadComponent: () =>
      import('@features/surveys/survey-create/components/conditional-logic/conditional-logic.component').then(
        (m) => m.ConditionalLogicComponent,
      ),
  },
] as Routes;
