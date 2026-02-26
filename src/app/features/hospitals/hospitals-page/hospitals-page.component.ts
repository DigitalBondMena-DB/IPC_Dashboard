import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { BDataTableComponent } from '@shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { HospitalsService } from '../services/hospitals.service';
import { ITableColumn } from '@shared/models/table.model';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-hospitals-page',
  standalone: true,
  imports: [BDataTableComponent, BPageHeaderComponent],
  template: `
    <app-b-page-header
      title="Hospitals"
      createButtonLabel="Create Hospital"
      (searchChange)="onSearch($event)"
      (createClick)="onCreate()"
    />

    <app-b-data-table
      [columns]="columns"
      [data]="tableData()"
      [totalRecords]="totalRecords()"
      [rows]="tableState().perPage"
      [page]="tableState().page"
      [loading]="isLoading()"
      [error]="hasError()"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (rowsChange)="onRowsChange($event)"
      (retryLoad)="onRetry()"
      (toggleChange)="onToggle($event)"
      (editClick)="onEdit($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalsPageComponent {
  private readonly _Service = inject(HospitalsService);
  private readonly _MessageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly columns: ITableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'health_directorate_name', header: 'Health Directorate', sortable: true },
    { field: 'health_division_name', header: 'Health Division', sortable: true },
    { field: 'division_name', header: 'Division', sortable: true },
    { field: 'updated_at', header: 'Last Update', sortable: true, type: 'date' },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle' },
  ];

  tableState = signal({
    page: 1,
    perPage: 10,
    search: '',
    sortBy: '',
    sortDir: '' as 'asc' | 'desc' | '',
  });

  params = computed(() => {
    const s = this.tableState();
    const p: Record<string, string | number> = { page: s.page, per_page: s.perPage };
    if (s.search) p['search'] = s.search;
    if (s.sortBy) {
      p['sort_by'] = s.sortBy;
      p['sort_dir'] = s.sortDir || 'asc';
    }
    return p;
  });

  resource = this._Service.getHospitals(this.params);

  tableData = computed(() => this.resource.value()?.data ?? []);
  totalRecords = computed(() => this.resource.value()?.total ?? 0);
  isLoading = computed(() => this.resource.isLoading());
  hasError = computed(() => this.resource.error() !== undefined);

  onSearch(value: string): void {
    this.tableState.update((s) => ({ ...s, search: value, page: 1 }));
  }
  onPageChange(page: number): void {
    this.tableState.update((s) => ({ ...s, page }));
  }
  onSortChange(sort: { field: string; direction: 'asc' | 'desc' }): void {
    this.tableState.update((s) => ({ ...s, sortBy: sort.field, sortDir: sort.direction, page: 1 }));
  }
  onRowsChange(rows: number): void {
    this.tableState.update((s) => ({ ...s, perPage: rows, page: 1 }));
  }
  onRetry(): void {
    this.resource.reload();
  }

  onToggle(event: { item: any }): void {
    this._Service.toggleHospital(event.item.id).subscribe({
      next: () => {
        this.resource.reload();
        this._MessageService.add({ summary: 'Success', detail: 'Hospital toggled successfully' });
      },
      error: () => {
        this.resource.reload();
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle hospital',
        });
      },
    });
  }

  onEdit(item: any): void {
    this.router.navigate(['/hospitals/edit', item.id]);
  }
  onCreate(): void {
    this.router.navigate(['/hospitals/create']);
  }
}
