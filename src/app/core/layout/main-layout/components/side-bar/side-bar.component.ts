import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  LucideAngularModule,
  House,
  ClipboardList,
  Plus,
  LogOut,
  ChevronDown,
  LucideIconData,
  ArrowLeftToLine,
  ArrowRightToLine,
  ChartColumn,
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
    Survey: ClipboardList,
    Reports: ChartColumn,
    Plus: Plus,

    LogOut: LogOut,
    ChevronDown: ChevronDown,
    ArrowLeftToLine: ArrowLeftToLine,
    ArrowRightToLine: ArrowRightToLine,
  };

  menuItems = input.required<NavItem[]>();
  internalMenuItems = signal<NavItem[]>([]);

  constructor() {
    effect(
      () => {
        const items = this.menuItems();
        this.internalMenuItems.set(items);
      },
      { allowSignalWrites: true },
    );
  }

  toggleSubMenu(item: NavItem) {
    if (this.isCollapsed()) {
      this.toggleSidebar();
    }
    this.internalMenuItems.update((items) =>
      items.map((i) => (i === item ? { ...i, expanded: !i.expanded } : i)),
    );
  }
  toggleSidebar() {
    this.isCollapsed.update((prev) => !prev);
    this.internalMenuItems.update((items) => items.map((i) => ({ ...i, expanded: false })));
  }
  logout() {
    this._AuthService.logout();
  }
}
