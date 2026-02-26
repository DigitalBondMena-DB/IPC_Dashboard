import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { DivisionsService } from '../services/divisions.service';
import { DIVISION_FORM_CONFIG } from '../config/division-form.config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-divisions-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
  templateUrl: './divisions-id.component.html',
  styleUrl: './divisions-id.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DivisionsIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _DivisionsService = inject(DivisionsService);
  private readonly _MessageService = inject(MessageService);

  readonly formConfig = DIVISION_FORM_CONFIG;

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => (this.isEdit() ? 'Edit Division' : 'Create Division'));

  // Resource for editing
  divisionResource = this.isEdit() ? this._DivisionsService.getDivisionById(this.id()!) : null;

  divisionData = computed(() => this.divisionResource?.value() || {});
  isLoading = computed(() => this.divisionResource?.isLoading() || false);
  isSubmitting = signal(false);

  onSubmit(data: any): void {
    this.isSubmitting.set(true);
    const id = this.id();

    const obs = id
      ? this._DivisionsService.updateDivision(id, data)
      : this._DivisionsService.createDivision(data);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `Division ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate(['/divisions']);
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
    this.router.navigate(['/divisions']);
  }
}
