export interface NavItem {
  label: string;
  icon?: string;
  routerLink?: string;
  children?: NavItem[];
  expanded?: boolean;
  isSection?: boolean;
  isButton?: boolean;
}
export interface NavItemWithChildren {
  lable: string;
  icon: string;
  children: NavItem[];
}
