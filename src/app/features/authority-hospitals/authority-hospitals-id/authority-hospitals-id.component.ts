import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { AuthorityHospitalsService } from '../services/authority-hospitals.service';
import { AuthoritiesService } from '../../authorities/services/authorities.service';
import { DivisionsService } from '../../divisions/services/divisions.service';
import { getAuthorityHospitalFormConfig } from '../config/authority-hospitals-form.config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-authority-hospitals-id',
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
export class AuthorityHospitalsIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(AuthorityHospitalsService);
  private readonly _AuthorityService = inject(AuthoritiesService);
  private readonly _DivisionService = inject(DivisionsService);
  private readonly _MessageService = inject(MessageService);

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() =>
    this.isEdit() ? "Edit Authority's Hospital" : "Create Authority's Hospital",
  );

  // Data for editing
  resource = this.isEdit() ? this._Service.getHospitalById(this.id()!) : null;
  data = computed(() => this.resource?.value() || {});
  isLoading = computed(() => this.resource?.isLoading() || false);

  // Options for dropdowns
  paramsAll = signal({ page: 1, per_page: 200 });

  authoritiesResource = this._AuthorityService.getAuthorities(this.paramsAll);
  divisionsResource = this._DivisionService.getDivisions(this.paramsAll);

  authorityOptions = computed(() =>
    (this.authoritiesResource.value()?.data ?? []).map((d: any) => ({
      label: d.name,
      value: d.id,
    })),
  );
  divisionOptions = computed(() =>
    (this.divisionsResource.value()?.data ?? []).map((d: any) => ({ label: d.name, value: d.id })),
  );

  isOptionsLoading = computed(
    () => this.authoritiesResource.isLoading() || this.divisionsResource.isLoading(),
  );

  formConfig = computed(() =>
    getAuthorityHospitalFormConfig(this.authorityOptions(), this.divisionOptions()),
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
        this.router.navigate(['/authorities-hospitals']);
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
    this.router.navigate(['/authorities-hospitals']);
  }
}
