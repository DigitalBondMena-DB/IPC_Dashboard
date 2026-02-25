export interface NavItem {
  label: string;
  icon?: string;
  routerLink?: string;
  children?: NavItem[];
  expanded?: boolean;
}
