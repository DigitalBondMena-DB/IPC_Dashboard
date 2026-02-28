import { Component, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
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

  // States for 2 dropdowns
  authoritySearch = signal('');
  authorityPage = signal(1);
  accumulatedAuthorities = signal<any[]>([]);

  divisionSearch = signal('');
  divisionPage = signal(1);
  accumulatedDivisions = signal<any[]>([]);

  // Authority Resource
  authorityParams = computed(() => ({
    page: this.authorityPage(),
    per_page: 50,
    search: this.authoritySearch(),
  }));
  authoritiesResource = this._AuthorityService.getAuthorities(this.authorityParams);

  // Division Resource
  divisionParams = computed(() => ({
    page: this.divisionPage(),
    per_page: 50,
    search: this.divisionSearch(),
  }));
  divisionsResource = this._DivisionService.getDivisions(this.divisionParams);

  // Effects to handle appending data
  private _authEffect = effect(() => {
    const res = this.authoritiesResource.value();
    if (res?.data) {
      if (this.authorityPage() === 1) this.accumulatedAuthorities.set(res.data);
      else this.accumulatedAuthorities.update((p) => [...p, ...res.data]);
    }
  });

  private _divEffect = effect(() => {
    const res = this.divisionsResource.value();
    if (res?.data) {
      if (this.divisionPage() === 1) this.accumulatedDivisions.set(res.data);
      else this.accumulatedDivisions.update((p) => [...p, ...res.data]);
    }
  });

  authorityOptions = computed(() => {
    const options = this.accumulatedAuthorities().map((d: any) => ({ label: d.name, value: d.id }));
    const status = this.authoritiesResource.value();
    if (status && this.authorityPage() < status.last_page) {
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
    () => this.authoritiesResource.isLoading() || this.divisionsResource.isLoading(),
  );

  formConfig = computed(() =>
    getAuthorityHospitalFormConfig(
      this.authorityOptions(),
      this.divisionOptions(),
      this.authoritiesResource.isLoading(),
      this.divisionsResource.isLoading(),
    ),
  );

  isSubmitting = signal(false);

  onDropdownSearch(event: { key: string; text: string }) {
    if (event.key === 'authority_id') {
      this.authoritySearch.set(event.text);
      this.authorityPage.set(1);
    } else if (event.key === 'division_id') {
      this.divisionSearch.set(event.text);
      this.divisionPage.set(1);
    }
  }

  onDropdownScroll(event: { key: string; event: any }) {
    const lastVisible = event.event.last;

    if (event.key === 'authority_id') {
      const res = this.authoritiesResource.value();
      if (!res || this.authoritiesResource.isLoading()) return;
      if (lastVisible >= this.accumulatedAuthorities().length - 1 && this.authorityPage() < res.last_page) {
        this.authorityPage.update((p) => p + 1);
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
