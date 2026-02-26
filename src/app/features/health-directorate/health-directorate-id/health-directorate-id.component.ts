import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { HealthDirectorateService } from '../services/health-directorate.service';
import { HEALTH_DIRECTORATE_FORM_CONFIG } from '../config/health-directorate-form.config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-health-directorate-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
  template: `
    <app-b-page-header [title]="title()" [showCreateButton]="false" />

    <div class="card p-8 bg-white rounded-2xl shadow-sm">
      @if (isLoading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#197bfd]"></div>
        </div>
      } @else {
        <app-b-form-builder
          [fields]="formConfig"
          [initialData]="data()"
          [submitLabel]="isEdit() ? 'Update Directorate' : 'Create Directorate'"
          [loading]="isSubmitting()"
          (formSubmit)="onSubmit($event)"
          (formCancel)="onCancel()"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthDirectorateIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(HealthDirectorateService);
  private readonly _MessageService = inject(MessageService);

  readonly formConfig = HEALTH_DIRECTORATE_FORM_CONFIG;

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => (this.isEdit() ? 'Edit Directorate' : 'Create Directorate'));

  resource = this.isEdit() ? this._Service.getDirectorateById(this.id()!) : null;

  data = computed(() => this.resource?.value() || {});
  isLoading = computed(() => this.resource?.isLoading() || false);
  isSubmitting = signal(false);

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const obs = id
      ? this._Service.updateDirectorate(id, formData)
      : this._Service.createDirectorate(formData);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `Directorate ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate(['/health-directorate']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${id ? 'update' : 'create'} directorate`,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/health-directorate']);
  }
}
