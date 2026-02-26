import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { HealthDivisionService } from '../services/health-division.service';
import { HealthDirectorateService } from '../../health-directorate/services/health-directorate.service';
import { getHealthDivisionFormConfig } from '../config/health-division-form.config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-health-division-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
  template: `
    <app-b-page-header [title]="title()" [showCreateButton]="false" />

    <div class="card p-8 bg-white rounded-2xl shadow-sm">
      @if (isLoading() || isOptionsLoading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#197bfd]"></div>
        </div>
      } @else {
        <app-b-form-builder
          [fields]="formConfig()"
          [initialData]="data()"
          [submitLabel]="isEdit() ? 'Update Division' : 'Create Division'"
          [loading]="isSubmitting()"
          (formSubmit)="onSubmit($event)"
          (formCancel)="onCancel()"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthDivisionIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(HealthDivisionService);
  private readonly _DirectorateService = inject(HealthDirectorateService);
  private readonly _MessageService = inject(MessageService);

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => (this.isEdit() ? 'Edit Health Division' : 'Create Health Division'));

  // Data for editing
  resource = this.isEdit() ? this._Service.getDivisionById(this.id()!) : null;
  data = computed(() => this.resource?.value() || {});
  isLoading = computed(() => this.resource?.isLoading() || false);

  // Options for dropdown
  directoratesParams = signal({ page: 1, per_page: 100 }); // Fetch all for dropdown
  directoratesResource = this._DirectorateService.getDirectorates(this.directoratesParams);
  directorateOptions = computed(() =>
    (this.directoratesResource.value()?.data ?? []).map((d: any) => ({
      label: d.name,
      value: d.id,
    })),
  );
  isOptionsLoading = computed(() => this.directoratesResource.isLoading());

  formConfig = computed(() => getHealthDivisionFormConfig(this.directorateOptions()));

  isSubmitting = signal(false);

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const obs = id
      ? this._Service.updateDivision(id, formData)
      : this._Service.createDivision(formData);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `Division ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate(['/health-division']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${id ? 'update' : 'create'} division`,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/health-division']);
  }
}
