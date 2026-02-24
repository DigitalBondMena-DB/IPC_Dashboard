import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { unAuthGuard } from './core/guards/un-auth-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    canActivate: [authGuard],
    path: '',
    component: MainLayoutComponent,
    loadChildren: () => {
      return [
        {
          path: '',
          loadChildren: () => import('@core/layout/main-layout/routes/mainLayout.routes'),
        },
      ];
    },
  },
  {
    canActivate: [unAuthGuard],
    path: 'login',
    loadComponent: () =>
      import('@features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
