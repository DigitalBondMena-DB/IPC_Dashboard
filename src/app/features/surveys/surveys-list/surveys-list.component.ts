import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { BDataTableComponent } from '@/shared/components/b-data-table/b-data-table.component';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';
import { SurveyService } from '../services/survey.service';
import { ITableColumn } from '@/shared/models/table.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-surveys-list',
  standalone: true,
  imports: [CommonModule, BDataTableComponent, BPageHeaderComponent],
  templateUrl: './surveys-list.component.html',
  styleUrl: './surveys-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveysListComponent {
  private readonly _SurveyService = inject(SurveyService);

  // Table Config
  columns: ITableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'division', header: 'Division', sortable: true },
    { field: 'created', header: 'Created', type: 'date', sortable: true },
    { field: 'last_update', header: 'Last Update', type: 'date', sortable: true },
    { field: 'updated_by', header: 'Updated By', sortable: true },
    { field: 'is_active', header: 'Actions', type: 'toggle' },
  ];

  // State
  params = signal<any>({
    page: 1,
    per_page: 10,
    search: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
    date_from: '',
    date_to: '',
    date_range: '',
  });
  hasError = computed(() => !!this.surveysResource.error());
  isLoading = computed(() => this.surveysResource.isLoading());
  // Data Resource
  surveysResource = this._SurveyService.getSurveys(this.params);

  // Actions
  onSearch(query: string) {
    this.params.update((p) => ({ ...p, search: query, page: 1 }));
  }

  onDateChange(event: { from: string; to: string }) {
    this.params.update((p) => ({
      ...p,
      date_from: event.from,
      date_to: event.to,
      page: 1,
    }));
  }

  onPageChange(page: number) {
    this.params.update((p) => ({ ...p, page }));
  }

  onRowsChange(per_page: number) {
    this.params.update((p) => ({ ...p, per_page, page: 1 }));
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }) {
    this.params.update((p) => ({
      ...p,
      sort_by: event.field,
      sort_dir: event.direction,
    }));
  }

  onToggle(event: { item: any; field: string; value: boolean }) {
    this._SurveyService.toggleSurvey(event.item.id).subscribe({
      next: () => this.surveysResource.reload(),
    });
  }

  onDuplicate(item: any) {
    this._SurveyService.duplicateSurvey(item.id).subscribe({
      next: () => this.surveysResource.reload(),
    });
  }

  onCreate() {
    console.log('Create new survey clicked');
    // Implement navigation to create page if needed
  }

  onEdit(item: any) {
    console.log('Edit survey clicked', item);
    // Implement navigation to edit page
  }
}
