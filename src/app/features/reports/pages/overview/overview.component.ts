import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';
import { EntityManagementService } from '@/features/entity-management/services/entity-management.service';

import { API_CONFIG } from '@/core/config/api.config';
import { BSelectComponent } from '@/shared/components/b-select/b-select.component';
import { BMultiSelectComponent } from '@/shared/components/b-multi-select/b-multi-select.component';
import { BDataTableComponent } from '@/shared/components/b-data-table/b-data-table.component';
import { ITableColumn } from '@/shared/models/table.model';
import {
  LucideAngularModule,
  ClipboardList,
  ClipboardCheck,
  ClipboardX,
  Users,
  FolderOpen,
  FolderTree,
  ListTodo,
  Percent,
  Eye,
} from 'lucide-angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BSelectComponent,
    BMultiSelectComponent,
    BDataTableComponent,
    LucideAngularModule,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly entityService = inject(EntityManagementService);

  // Filter Signals
  readonly selectedGovernorate = signal<number | null>(null);
  readonly selectedDirectorate = signal<number | null>(null);
  readonly selectedHospital = signal<number | null>(null);
  readonly selectedDivisions = signal<number[]>([]);
  readonly surveyorName = signal<string>('');
  readonly dateRange = signal<{ start: string; end: string } | null>(null);

  // API Params for Overview
  readonly overviewParams = computed(() => {
    const params: any = {};
    if (this.selectedHospital()) {
      params['entity_id'] = this.selectedHospital();
      params['entity_type'] = 'hospital';
    } else if (this.selectedDirectorate()) {
      params['entity_id'] = this.selectedDirectorate();
      params['entity_type'] = 'medical_area';
    } else if (this.selectedGovernorate()) {
      params['entity_id'] = this.selectedGovernorate();
      params['entity_type'] = 'governorate';
    }

    if (this.dateRange()) {
      params['start_date'] = this.dateRange()?.start;
      params['end_date'] = this.dateRange()?.end;
    }
    return params;
  });

  // Data Resources
  readonly overviewResource = this.reportsService.getOverview(this.overviewParams);

  // Metrics & Table Data
  readonly metrics = computed(() => this.overviewResource.value()?.data.metrics);
  readonly recentSubmissions = computed(
    () => this.overviewResource.value()?.data.recent_submissions,
  );
  readonly isLoading = computed(() => this.overviewResource.isLoading());

  // Table Config
  readonly tableColumns: ITableColumn[] = [
    { field: 'survey_name', header: 'Survey', sortable: false },
    { field: 'survivor_name', header: 'Surveyor', sortable: false },
    { field: 'submitted_at', header: 'Submitted at', sortable: false },
    { field: 'entity_name', header: 'Related to', sortable: false },
    { field: 'actions', header: 'Actions', type: 'actions', viewOnly: true, sortable: false },
  ];

  onView(item: any) {
    // To be implemented
    console.log('View:', item);
  }

  // Entity Options
  readonly governoratesResource = this.entityService.getEntities(
    API_CONFIG.ENDPOINTS.ENTITIES.BASE,
    'governorate',
    signal({ per_page: 100 }),
  );
  readonly governorateOptions = computed(
    () =>
      this.governoratesResource.value()?.data.map((e: any) => ({ label: e.name, value: e.id })) ||
      [],
  );

  readonly directoratesParams = computed(() => ({
    per_page: 100,
    parent_id: this.selectedGovernorate() || '',
  }));
  readonly directoratesResource = this.entityService.getEntities(
    API_CONFIG.ENDPOINTS.ENTITIES.BASE,
    'medical_area',
    this.directoratesParams,
  );
  readonly directorateOptions = computed(
    () =>
      this.directoratesResource.value()?.data.map((e: any) => ({ label: e.name, value: e.id })) ||
      [],
  );

  readonly hospitalsParams = computed(() => ({
    per_page: 100,
    parent_id: this.selectedDirectorate() || '',
  }));
  readonly hospitalsResource = this.entityService.getEntities(
    API_CONFIG.ENDPOINTS.ENTITIES.BASE,
    'hospital',
    this.hospitalsParams,
  );
  readonly hospitalOptions = computed(
    () =>
      this.hospitalsResource.value()?.data.map((e: any) => ({ label: e.name, value: e.id })) || [],
  );

  // Divisions Options
  readonly divisionsResource = this.entityService.get<any>(
    API_CONFIG.ENDPOINTS.CATEGORIES,
    signal({ per_page: 100 }),
  );
  readonly divisionOptions = computed(
    () =>
      this.divisionsResource.value()?.data.map((e: any) => ({ label: e.name, value: e.id })) || [],
  );

  // Icons
  readonly icons = {
    TotalSurveys: ClipboardList,
    clipboardCheck: ClipboardCheck,
    clipboardX: ClipboardX,
    Surveyor: Users,
    folderOpen: FolderOpen,
    folderTree: FolderTree,
    listTodo: ListTodo,
    Percentage: Percent,
    Eye: Eye,
  };

  onGovernorateChange(id: any) {
    this.selectedGovernorate.set(id);
    this.selectedDirectorate.set(null);
    this.selectedHospital.set(null);
  }

  onDirectorateChange(id: any) {
    this.selectedDirectorate.set(id);
    this.selectedHospital.set(null);
  }

  onHospitalChange(id: any) {
    this.selectedHospital.set(id);
  }

  applyFilter() {
    // The overviewParams computed signal will automatically trigger a reload of overviewResource
    console.log('Filters Applied:', this.overviewParams());
  }

  onSurveyorSearch() {
    // To be implemented
  }
}
