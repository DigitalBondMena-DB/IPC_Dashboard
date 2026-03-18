import { Component, signal } from '@angular/core';
import { SideBarComponent } from '@/core/layout/main-layout/components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { MainFooterComponent } from '@/core/layout/main-layout/components/main-footer/main-footer.component';
import { REPORTS_MENU_ITEMS, MAIN_FOOTER_CONFIG } from '@/shared/models/navigation.constants';

@Component({
  selector: 'app-reports-layout',
  imports: [SideBarComponent, RouterOutlet, MainFooterComponent],
  template: `
    <div class="flex h-screen bg-[#FDFDFD] overflow-hidden">
      <!-- Sidebar -->
      <app-side-bar [menuItems]="menuItems()" [footerConfig]="footerConfig()" />

      <!-- Main Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Content -->
        <main class="flex-1 overflow-y-auto px-8 pt-4 custom-scrollbar">
          <div class="max-w-[1600px] mx-auto flex flex-col justify-between min-h-full">
            <div class="flex-1">
              <router-outlet />
            </div>
            <app-main-footer />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
})
export class ReportsLayoutComponent {
  menuItems = signal(REPORTS_MENU_ITEMS);
  footerConfig = signal(MAIN_FOOTER_CONFIG);
}

