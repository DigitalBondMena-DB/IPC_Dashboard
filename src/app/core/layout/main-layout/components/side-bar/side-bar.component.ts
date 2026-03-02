import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  LucideAngularModule,
  House,
  Building2,
  Combine,
  Users,
  ClipboardList,
  Plus,
  LogOut,
  ChevronDown,
  LucideIconData,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-angular';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { NavItem } from '@/shared/models/nav-item.model';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-side-bar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, AvatarModule, TooltipModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarComponent {
  private readonly _AuthService = inject(AuthService);
  isCollapsed = signal(false);
  userData = computed(() => this._AuthService.userData());
  readonly icons: Record<string, LucideIconData> = {
    Dashboard: House,
    Divisions: Building2,
    Entities: Combine,
    Users: Users,
    Survey: ClipboardList,
    Plus: Plus,
    LogOut: LogOut,
    ChevronDown: ChevronDown,
    ArrowLeftToLine: ArrowLeftToLine,
    ArrowRightToLine: ArrowRightToLine,
  };

  menuItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'Dashboard', routerLink: '/' },
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
  ]);
  toggleSubMenu(item: NavItem) {
    if (this.isCollapsed()) {
      this.toggleSidebar();
    }
    this.menuItems.update((items) =>
      items.map((i) => (i === item ? { ...i, expanded: !i.expanded } : i)),
    );
  }
  toggleSidebar() {
    this.isCollapsed.update((prev) => !prev);
  }
  logout() {
    this._AuthService.logout();
  }
}
