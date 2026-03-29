import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HomeService } from '../services/home.service';
import { IHomeResponse } from '../interfaces/home';
import { HttpResourceRef } from '@angular/common/http';
import { TopBarComponent } from '@/core/layout/main-layout/components/top-bar/top-bar.component';
import { HomeSkeletonComponent } from '../components/home-skeleton/home-skeleton.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TopBarComponent, HomeSkeletonComponent],
})
export class HomePageComponent {
  private homeService = inject(HomeService);
  private homeResponse: HttpResourceRef<IHomeResponse | undefined> = this.homeService.getHomeData();
  counts = computed(() => this.homeResponse.value()?.data.counts);
  isLoading = computed(() => this.homeResponse.isLoading());
}
