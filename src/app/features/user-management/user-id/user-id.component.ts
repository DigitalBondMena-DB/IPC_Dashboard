import { Component, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { UserManagementService } from '../services/user-management.service';
import { getUserFormConfig } from '../config/user-form.config';
import { USER_TYPE_CONFIG } from '../config/user-type.config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-id',
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
          [initialData]="userData()"
          [submitLabel]="submitLabel()"
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
export class UserIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(UserManagementService);
  private readonly _MessageService = inject(MessageService);

  readonly type = signal<string>(this.route.snapshot.data['type']);
  readonly config = computed(() => USER_TYPE_CONFIG[this.type()]);

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => `${this.isEdit() ? 'Edit' : 'Create'} ${this.config().entityLabel} User`);
  submitLabel = computed(() => `${this.isEdit() ? 'Update' : 'Create'} User`);

  // User data for editing
  userResource = this.isEdit()
    ? this._Service.getUserById(this.config().endpoint, this.config().userType, this.id()!)
    : null;
  userData = computed(() => this.userResource?.value() || {});
  isLoading = computed(() => this.userResource?.isLoading() || false);

  // Entity options with search and scroll
  searchTerm = signal('');
  optionsPage = signal(1);
  accumulatedOptions = signal<any[]>([]);

  optionsParams = computed(() => ({
    page: this.optionsPage(),
    per_page: 50,
    search: this.searchTerm(),
    ...(this.config().entityType ? { type: this.config().entityType } : {}),
  }));

  optionsResource = this._Service.get<any>(this.config().entityEndpoint, this.optionsParams);

  // Effect to append results for infinite scroll
  private _optionsEffect = effect(() => {
    const response = this.optionsResource.value();
    if (response?.data) {
      if (this.optionsPage() === 1) {
        this.accumulatedOptions.set(response.data);
      } else {
        this.accumulatedOptions.update((prev) => [...prev, ...response.data]);
      }
    }
  });

  entityOptions = computed(() => {
    const options = this.accumulatedOptions().map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
    const res = this.optionsResource.value();
    if (res && this.optionsPage() < res.last_page) {
      options.push({ label: null, value: null });
    }
    return options;
  });
  isOptionsLoading = computed(() => this.optionsResource.isLoading());

  formConfig = computed(() =>
    getUserFormConfig(
      this.config().entityLabel,
      this.config().entityKey,
      this.entityOptions(),
      this.isEdit(),
      this.optionsResource.isLoading(),
    ),
  );

  isSubmitting = signal(false);

  onDropdownSearch(event: { key: string; text: string }) {
    this.searchTerm.set(event.text);
    this.optionsPage.set(1);
  }

  onDropdownScroll(event: { key: string; event: any }) {
    const res = this.optionsResource.value();
    if (!res || this.optionsResource.isLoading()) return;

    const lastVisible = event.event.last;
    const currentCount = this.accumulatedOptions().length;

    if (lastVisible >= currentCount - 1 && this.optionsPage() < res.last_page) {
      this.optionsPage.update((p) => p + 1);
    }
  }

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const endpoint = this.config().endpoint;
    const userType = this.config().userType;

    // Prepare data (for edit, password fields might be omitted)
    const data = { ...formData };

    const obs = id
      ? this._Service.updateUser(endpoint, userType, id, data)
      : this._Service.createUser(endpoint, userType, data);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `User ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate([this.config().navPath]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || `Failed to ${id ? 'update' : 'create'} user`,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.config().navPath]);
  }
}
