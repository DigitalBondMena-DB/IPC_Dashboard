import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { SurveyStepsComponent } from './components/survey-steps/survey-steps.component';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SurveyStepsComponent,
    LucideAngularModule,
    BPageHeaderComponent,
  ],
  template: `
    <div class="h-full flex flex-col">
      <app-b-page-header [title]="pageTitle()" />
      <div
        class="bg-gray-[#F9FAFB] mt-9 flex-1 flex flex-col overflow-hidden border border-gray-100"
      >
        <app-survey-steps [currentStep]="currentStep()" />

        <div class="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class SurveyCreateComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly chevronLeftIcon = ChevronLeft;

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));

  pageTitle = computed(() => (this.id() ? 'Edit Survey' : 'Create Survey'));

  currentStep = signal(0);

  constructor() {}
  ngOnInit(): void {
    this.checkRoute();
    this.router.events.subscribe(() => {
      this.checkRoute();
    });
  }
  checkRoute(): void {
    const url = this.router.url;
    console.log(url);

    if (url.includes('setup')) {
      this.currentStep.set(0);
    } else if (url.includes('preliminary-questions')) {
      this.currentStep.set(1);
    } else if (url.includes('structure')) {
      this.currentStep.set(2);
    }
  }
  goBack() {
    this.router.navigate(['/survey']);
  }
}
