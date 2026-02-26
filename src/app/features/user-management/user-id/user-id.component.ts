import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
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
      @if (isLoading() || isOptionsLoading()) {
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
    ? this._Service.getUserById(this.config().endpoint, this.id()!)
    : null;
  userData = computed(() => this.userResource?.value() || {});
  isLoading = computed(() => this.userResource?.isLoading() || false);

  // Entity options for levels
  optionsParams = signal({ page: 1, per_page: 200 }); // Fetch all for dropdown
  optionsResource = this._Service.get<any>(this.config().entityEndpoint, this.optionsParams);
  entityOptions = computed(() =>
    (this.optionsResource.value()?.data ?? []).map((item: any) => ({
      label: item.name,
      value: item.id,
    })),
  );
  isOptionsLoading = computed(() => this.optionsResource.isLoading());

  formConfig = computed(() =>
    getUserFormConfig(
      this.config().entityLabel,
      this.config().entityKey,
      this.entityOptions(),
      this.isEdit(),
    ),
  );

  isSubmitting = signal(false);

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const endpoint = this.config().endpoint;

    // Prepare data (for edit, password fields might be omitted)
    const data = { ...formData };

    const obs = id
      ? this._Service.updateUser(endpoint, id, data)
      : this._Service.createUser(endpoint, data);

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
