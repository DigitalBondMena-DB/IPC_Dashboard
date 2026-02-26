import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { HospitalsService } from '../services/hospitals.service';
import { HealthDirectorateService } from '../../health-directorate/services/health-directorate.service';
import { HealthDivisionService } from '../../health-division/services/health-division.service';
import { DivisionsService } from '../../divisions/services/divisions.service';
import { getHospitalFormConfig } from '../config/hospitals-form.config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-hospitals-id',
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
          [submitLabel]="isEdit() ? 'Update Hospital' : 'Create Hospital'"
          [loading]="isSubmitting()"
          (formSubmit)="onSubmit($event)"
          (formCancel)="onCancel()"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalsIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(HospitalsService);
  private readonly _DirectorateService = inject(HealthDirectorateService);
  private readonly _HealthDivisionService = inject(HealthDivisionService);
  private readonly _DivisionService = inject(DivisionsService);
  private readonly _MessageService = inject(MessageService);

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => (this.isEdit() ? 'Edit Hospital' : 'Create Hospital'));

  // Data for editing
  resource = this.isEdit() ? this._Service.getHospitalById(this.id()!) : null;
  data = computed(() => this.resource?.value() || {});
  isLoading = computed(() => this.resource?.isLoading() || false);

  // Options for dropdowns
  paramsAll = signal({ page: 1, per_page: 200 });

  directoratesResource = this._DirectorateService.getDirectorates(this.paramsAll);
  healthDivisionsResource = this._HealthDivisionService.getDivisions(this.paramsAll);
  divisionsResource = this._DivisionService.getDivisions(this.paramsAll);

  directorateOptions = computed(() =>
    (this.directoratesResource.value()?.data ?? []).map((d: any) => ({
      label: d.name,
      value: d.id,
    })),
  );
  healthDivisionOptions = computed(() =>
    (this.healthDivisionsResource.value()?.data ?? []).map((d: any) => ({
      label: d.name,
      value: d.id,
    })),
  );
  divisionOptions = computed(() =>
    (this.divisionsResource.value()?.data ?? []).map((d: any) => ({ label: d.name, value: d.id })),
  );

  isOptionsLoading = computed(
    () =>
      this.directoratesResource.isLoading() ||
      this.healthDivisionsResource.isLoading() ||
      this.divisionsResource.isLoading(),
  );

  formConfig = computed(() =>
    getHospitalFormConfig(
      this.directorateOptions(),
      this.healthDivisionOptions(),
      this.divisionOptions(),
    ),
  );

  isSubmitting = signal(false);

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const obs = id
      ? this._Service.updateHospital(id, formData)
      : this._Service.createHospital(formData);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `Hospital ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate(['/hospitals']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${id ? 'update' : 'create'} hospital`,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/hospitals']);
  }
}
