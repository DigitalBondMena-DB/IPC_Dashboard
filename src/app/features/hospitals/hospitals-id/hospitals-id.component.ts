import { Component, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
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
      @if (isLoading()) {
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
          (onSearch)="onDropdownSearch($event)"
          (onScrollPagination)="onDropdownScroll($event)"
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

  // States for 3 dropdowns
  directorateSearch = signal('');
  directoratePage = signal(1);
  accumulatedDirectorates = signal<any[]>([]);

  healthDivisionSearch = signal('');
  healthDivisionPage = signal(1);
  accumulatedHealthDivisions = signal<any[]>([]);

  divisionSearch = signal('');
  divisionPage = signal(1);
  accumulatedDivisions = signal<any[]>([]);

  // Directorate Resource
  directorateParams = computed(() => ({
    page: this.directoratePage(),
    per_page: 50,
    search: this.directorateSearch(),
  }));
  directoratesResource = this._DirectorateService.getDirectorates(this.directorateParams);

  // Health Division Resource
  healthDivisionParams = computed(() => ({
    page: this.healthDivisionPage(),
    per_page: 50,
    search: this.healthDivisionSearch(),
  }));
  healthDivisionsResource = this._HealthDivisionService.getDivisions(this.healthDivisionParams);

  // Division Resource
  divisionParams = computed(() => ({
    page: this.divisionPage(),
    per_page: 50,
    search: this.divisionSearch(),
  }));
  divisionsResource = this._DivisionService.getDivisions(this.divisionParams);

  // Effects to handle appending data
  private _dirEffect = effect(() => {
    const res = this.directoratesResource.value();
    if (res?.data) {
      if (this.directoratePage() === 1) this.accumulatedDirectorates.set(res.data);
      else this.accumulatedDirectorates.update((p) => [...p, ...res.data]);
    }
  });

  private _hdivEffect = effect(() => {
    const res = this.healthDivisionsResource.value();
    if (res?.data) {
      if (this.healthDivisionPage() === 1) this.accumulatedHealthDivisions.set(res.data);
      else this.accumulatedHealthDivisions.update((p) => [...p, ...res.data]);
    }
  });

  private _divEffect = effect(() => {
    const res = this.divisionsResource.value();
    if (res?.data) {
      if (this.divisionPage() === 1) this.accumulatedDivisions.set(res.data);
      else this.accumulatedDivisions.update((p) => [...p, ...res.data]);
    }
  });

  directorateOptions = computed(() => {
    const options = this.accumulatedDirectorates().map((d: any) => ({ label: d.name, value: d.id }));
    const status = this.directoratesResource.value();
    if (status && this.directoratePage() < status.last_page) {
      options.push({ label: null, value: null });
    }
    return options;
  });

  healthDivisionOptions = computed(() => {
    const options = this.accumulatedHealthDivisions().map((d: any) => ({ label: d.name, value: d.id }));
    const status = this.healthDivisionsResource.value();
    if (status && this.healthDivisionPage() < status.last_page) {
      options.push({ label: null, value: null });
    }
    return options;
  });

  divisionOptions = computed(() => {
    const options = this.accumulatedDivisions().map((d: any) => ({ label: d.name, value: d.id }));
    const status = this.divisionsResource.value();
    if (status && this.divisionPage() < status.last_page) {
      options.push({ label: null, value: null });
    }
    return options;
  });

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
      this.directoratesResource.isLoading(),
      this.healthDivisionsResource.isLoading(),
      this.divisionsResource.isLoading(),
    ),
  );

  isSubmitting = signal(false);

  onDropdownSearch(event: { key: string; text: string }) {
    if (event.key === 'health_directorate_id') {
      this.directorateSearch.set(event.text);
      this.directoratePage.set(1);
    } else if (event.key === 'health_division_id') {
      this.healthDivisionSearch.set(event.text);
      this.healthDivisionPage.set(1);
    } else if (event.key === 'division_id') {
      this.divisionSearch.set(event.text);
      this.divisionPage.set(1);
    }
  }

  onDropdownScroll(event: { key: string; event: any }) {
    const lastVisible = event.event.last;

    if (event.key === 'health_directorate_id') {
      const res = this.directoratesResource.value();
      if (!res || this.directoratesResource.isLoading()) return;
      if (lastVisible >= this.accumulatedDirectorates().length - 1 && this.directoratePage() < res.last_page) {
        this.directoratePage.update((p) => p + 1);
      }
    } else if (event.key === 'health_division_id') {
      const res = this.healthDivisionsResource.value();
      if (!res || this.healthDivisionsResource.isLoading()) return;
      if (lastVisible >= this.accumulatedHealthDivisions().length - 1 && this.healthDivisionPage() < res.last_page) {
        this.healthDivisionPage.update((p) => p + 1);
      }
    } else if (event.key === 'division_id') {
      const res = this.divisionsResource.value();
      if (!res || this.divisionsResource.isLoading()) return;
      if (lastVisible >= this.accumulatedDivisions().length - 1 && this.divisionPage() < res.last_page) {
        this.divisionPage.update((p) => p + 1);
      }
    }
  }

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
