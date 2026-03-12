import { Component, signal } from '@angular/core';
import { SideBarComponent } from '../main-layout/components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { MainFooterComponent } from '../main-layout/components/main-footer/main-footer.component';
import { SURVEY_MENU_ITEMS, SURVEY_FOOTER_CONFIG } from '@/shared/models/navigation.constants';

@Component({
  selector: 'app-survey-layout',
  standalone: true,
  imports: [SideBarComponent, RouterOutlet, MainFooterComponent],
  template: `
    <div class="flex h-screen bg-[#FDFDFD] overflow-hidden">
      <!-- Sidebar -->
      <app-side-bar [menuItems]="menuItems()" [footerConfig]="footerConfig()" />

      <!-- Main Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Content -->
        <main class="flex-1 overflow-y-auto px-2 pt-4 custom-scrollbar text-[#F5F7FA]">
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
  styles: [],
})
export class SurveyLayoutComponent {
  menuItems = signal(SURVEY_MENU_ITEMS);
  footerConfig = signal(SURVEY_FOOTER_CONFIG);
}
