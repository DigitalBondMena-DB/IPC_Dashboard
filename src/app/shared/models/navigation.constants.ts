import { NavItem } from './nav-item.model';

export interface SidebarFooterConfig {
  title: string;
  buttons: { label: string; routerLink: string }[];
}

export const MAIN_MENU_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'Dashboard', routerLink: '/dashboard' },
  { label: 'Reports', icon: 'Reports', routerLink: '/reports' },
  { label: 'Divisions', icon: 'Divisions', routerLink: '/divisions' },
  {
    label: 'Entities',
    icon: 'Entities',
    expanded: false,
    children: [
      { label: 'Health Directorate', routerLink: '/health-directorate' },
      { label: 'Health Division', routerLink: '/health-division' },
      { label: 'Hospitals', routerLink: '/hospitals' },
      { label: 'Authorities', routerLink: '/authorities' },
      { label: "Authority's Hospitals", routerLink: '/authorities-hospitals' },
    ],
  },
  {
    label: 'User Management',
    icon: 'Users',
    expanded: false,
    children: [
      { label: 'Super Admin', routerLink: '/super-admin-users' },
      { label: 'Health Directorate', routerLink: '/health-directorate-users' },
      { label: 'Health Division', routerLink: '/health-division-users' },
      { label: 'Hospitals', routerLink: '/hospitals-users' },
      { label: 'Authorities', routerLink: '/authorities-users' },
      { label: "Authority's Hospitals", routerLink: '/authorities-hospitals-users' },
    ],
  },
];

export const REPORTS_MENU_ITEMS: NavItem[] = [
  { label: 'Overview', icon: 'Dashboard', routerLink: '/reports/overview' },
  { label: 'Survey Level', icon: 'Survey', routerLink: '/reports/survey-level' },
  { label: 'Entity Level', icon: 'Divisions', routerLink: '/reports/entity-level' },
  { label: 'Visit Results', icon: 'GitFork', routerLink: '/reports/visit-results' },
  { label: 'Surveyor Results', icon: 'Users', routerLink: '/reports/surveyor-results' },
  { label: 'Action Plan', icon: 'Plus', routerLink: '/reports/action-plan' },
  { label: 'Filter', icon: 'Dashboard', routerLink: '/reports/filter' },
];

export const SURVEY_MENU_ITEMS: NavItem[] = [
  { label: 'Surveys', icon: 'Survey', routerLink: '/survey' },
  { label: 'Conditional logic', icon: 'GitFork', routerLink: '/survey/conditional-logic' },
];

export const MAIN_FOOTER_CONFIG: SidebarFooterConfig = {
  title: 'Switch between Dashboard and Survey Builder.',
  buttons: [
    { label: 'Reports', routerLink: '/reports' },
    { label: 'Survey Builder', routerLink: '/survey' },
  ],
};

export const SURVEY_FOOTER_CONFIG: SidebarFooterConfig = {
  title: 'Switch between Dashboard and Survey Builder.',
  buttons: [
    { label: 'Dashboard', routerLink: '/dashboard' },
    { label: 'Reports', routerLink: '/reports' },
  ],
};
