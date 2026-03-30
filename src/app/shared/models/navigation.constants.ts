import { NavItem } from './nav-item.model';

export interface SidebarFooterConfig {
  title: string;
  buttons: { label: string; routerLink: string }[];
}

export const ALL_MENU_ITEMS: NavItem[] = [
  { label: 'User Management', icon: 'Dashboard', isSection: true },
  { label: 'Overview', routerLink: '/dashboard' },
  { label: 'Divisions', routerLink: '/dashboard/divisions' },
  {
    label: 'Entities',
    expanded: false,
    children: [
      { label: 'Health Directorate', routerLink: '/dashboard/health-directorate' },
      { label: 'Health Division', routerLink: '/dashboard/health-division' },
      { label: 'Hospitals', routerLink: '/dashboard/hospitals' },
      { label: 'Authorities', routerLink: '/dashboard/authorities' },
      { label: "Authority's Hospitals", routerLink: '/dashboard/authorities-hospitals' },
    ],
  },
  {
    label: 'User Management',
    expanded: false,
    children: [
      { label: 'Super Admin', routerLink: '/dashboard/super-admin-users' },
      { label: 'Health Directorate', routerLink: '/dashboard/health-directorate-users' },
      { label: 'Health Division', routerLink: '/dashboard/health-division-users' },
      { label: 'Hospitals', routerLink: '/dashboard/hospitals-users' },
      { label: 'Authorities', routerLink: '/dashboard/authorities-users' },
      { label: "Authority's Hospitals", routerLink: '/dashboard/authorities-hospitals-users' },
    ],
  },

  { label: 'Survey Builder', icon: 'Survey', isSection: true },
  { label: 'New Survey', icon: 'Plus', routerLink: '/survey/create/setup', isButton: true },
  { label: 'Surveys', routerLink: '/survey' },
  { label: 'Conditional logic', routerLink: '/survey/conditional-logic' },

  { label: 'Reports', icon: 'Reports', isSection: true },
  { label: 'Overview', routerLink: '/reports/overview' },
  { label: 'Survey Level', routerLink: '/reports/survey-level' },
  { label: 'Entity Level', routerLink: '/reports/entity-level' },
  { label: 'Visit Results', routerLink: '/reports/visit-results' },
  { label: 'Surveyor Results', routerLink: '/reports/surveyor-results' },
  { label: 'Action Plan', routerLink: '/reports/action-plan' },
  { label: 'Filter', routerLink: '/reports/filter' },
];

export const MAIN_MENU_ITEMS: NavItem[] = ALL_MENU_ITEMS;
export const SURVEY_MENU_ITEMS: NavItem[] = ALL_MENU_ITEMS;
