import { NavItem } from './nav-item.model';

export interface SidebarFooterConfig {
  title: string;
  buttons: { label: string; routerLink: string }[];
}

export const MAIN_MENU_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'Dashboard', routerLink: '/dashboard' },
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

export const SURVEY_MENU_ITEMS: NavItem[] = [
  { label: 'Surveys', icon: 'Survey', routerLink: '/survey' },
];

export const MAIN_FOOTER_CONFIG: SidebarFooterConfig = {
  title: 'Switch between Reports and Survey Builder.',
  buttons: [
    { label: 'Survey Builder', routerLink: '/survey' },
    { label: 'Reports', routerLink: '/dashboard' },
  ],
};

export const SURVEY_FOOTER_CONFIG: SidebarFooterConfig = {
  title: 'Switch between Reports and Survey Builder.',
  buttons: [
    { label: 'Survey Builder', routerLink: '/survey' },
    { label: 'Reports', routerLink: '/dashboard' },
  ],
};
