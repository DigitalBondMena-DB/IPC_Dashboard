import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { BDataTableComponent } from '@shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { DivisionsService } from '../services/divisions.service';
import { Router } from '@angular/router';
import { ITableColumn } from '@shared/models/table.model';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-divisions-page',
  imports: [BDataTableComponent, BPageHeaderComponent, LucideAngularModule, FormsModule],
  templateUrl: './divisions-page.component.html',
  styleUrl: './divisions-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DivisionsPageComponent {
  private readonly _DivisionsService = inject(DivisionsService);
  private readonly _MessageService = inject(MessageService);
  private readonly router = inject(Router);

  // Table columns config
  readonly columns: ITableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
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

    const p: Record<string, string | number> = {
      page: s.page,
      per_page: s.perPage,
    };

    if (s.search) p['search'] = s.search;

    if (s.sortBy) {
      p['sort_by'] = s.sortBy;
      p['sort_dir'] = s.sortDir || 'asc';
    }

    return p;
  });

  // Resource
  divisionsResource = this._DivisionsService.getDivisions(this.params);

  // Computed data from resource
  tableData = computed(() => this.divisionsResource.value()?.data ?? []);
  totalRecords = computed(() => this.divisionsResource.value()?.total ?? 0);
  isLoading = computed(() => this.divisionsResource.isLoading());
  hasError = computed(() => this.divisionsResource.error() !== undefined);

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
    this.divisionsResource.reload();
  }

  onToggle(event: { item: any; field: string; value: boolean }): void {
    this._DivisionsService.toggleDivision(event.item.id).subscribe({
      next: () => {
        this.divisionsResource.reload();
        this._MessageService.add({
          summary: 'Success',
          detail: 'Division toggled successfully',
        });
      },
      error: () => {
        this.divisionsResource.reload();
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle division',
        });
      },
    });
  }

  onEdit(item: any): void {
    this.router.navigate(['/divisions/edit', item.id]);
  }

  onCreateDivision(): void {
    this.router.navigate(['/divisions/create']);
  }
}
