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
  userData = computed(() => this._AuthService.userData());
  readonly icons: Record<string, LucideIconData> = {
    Dashboard: House,
    Divisions: Building2,
    Entities: Combine,
    Users: Users,
    Survey: ClipboardList,
    Plus: Plus,
    Logout: LogOut,
    ChevronDown: ChevronDown,
  };

  menuItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'Dashboard', routerLink: '/dashboard' },
    { label: 'Divisions', icon: 'Divisions', routerLink: '/divisions' },
    {
      label: 'Entities',
      icon: 'Entities',
      expanded: false,
      children: [{ label: 'All Entities', routerLink: '/entities' }],
    },
    {
      label: 'User Management',
      icon: 'Users',
      expanded: false,
      children: [{ label: 'Users list', routerLink: '/users' }],
    },
  ]);

  toggleSubMenu(item: NavItem) {
    this.menuItems.update((items) =>
      items.map((i) => (i === item ? { ...i, expanded: !i.expanded } : i)),
    );
  }

  logout() {
    this._AuthService.logout();
  }
}
