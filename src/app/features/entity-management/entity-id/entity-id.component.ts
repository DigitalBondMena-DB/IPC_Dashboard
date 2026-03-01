import { Component, ChangeDetectionStrategy, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { EntityManagementService } from '../services/entity-management.service';
import { MessageService } from 'primeng/api';
import { ENTITY_TYPE_CONFIG } from '../config/entity-type.config';
import { API_CONFIG } from '@/core/config/api.config';

@Component({
    selector: 'app-entity-id',
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
          [fields]="fields()"
          [initialData]="entityData()"
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
export class EntityIdComponent {
    private readonly _Service = inject(EntityManagementService);
    private readonly _MessageService = inject(MessageService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
    readonly type = signal<string>(this.route.snapshot.data['type']);
    readonly config = computed(() => ENTITY_TYPE_CONFIG[this.type()]);
    readonly isEdit = computed(() => !!this.id());

    readonly title = computed(() => `${this.isEdit() ? 'Edit ' : 'Create '} ${this.config().entityLabel}`);
    readonly submitLabel = computed(() => `${this.isEdit() ? 'Update ' : 'Create '} ${this.config().entityLabel}`);

    // Entity data for editing
    entityResource = this.isEdit()
        ? this._Service.getEntityById(this.config().endpoint, this.config().entity_type, this.id()!)
        : null;
    entityData = computed(() => this.entityResource ? this.entityResource.value() : {});
    isLoading = computed(() => this.entityResource ? this.entityResource.isLoading() : false);

    // Relational data management
    private depsState = signal<Record<string, {
        searchTerm: any;
        page: any;
        accumulated: any;
        resource: any;
    }>>({});

    constructor() {
        this.initDependencies();
    }

    private initDependencies(): void {
        const deps = this.config().dependencies || [];
        const state: any = {};

        deps.forEach((dep: string) => {
            const depConfig = this.getDepConfig(dep);
            const searchTerm = signal('');
            const page = signal(1);

            const params = computed(() => ({
                page: page(),
                per_page: 50,
                search: searchTerm(),
                ...(depConfig.type ? { type: depConfig.type } : {}),
            }));

            const resource = this._Service.get<any>(depConfig.endpoint, params);
            const accumulated = signal<any[]>([]);

            // Sync accumulated data
            effect(() => {
                const res = resource.value();
                if (res?.data) {
                    if (page() === 1) accumulated.set(res.data);
                    else accumulated.update(prev => [...prev, ...res.data]);
                }
            }, { allowSignalWrites: true });

            state[depConfig.key] = { searchTerm, page, accumulated, resource };
        });

        this.depsState.set(state);
    }

    private getDepConfig(dep: string): { key: string; endpoint: string; type?: string } {
        const mapping: Record<string, any> = {
            directorates: { key: 'health_directorate_id', endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE, type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIRECTORATE },
            healthDivisions: { key: 'health_division_id', endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE, type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIVISION },
            generalDivisions: { key: 'division_id', endpoint: API_CONFIG.ENDPOINTS.CATEGORIES },
            authorities: { key: 'authority_id', endpoint: API_CONFIG.ENDPOINTS.ENTITIES.BASE, type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY },
        };
        return mapping[dep];
    }

    fields = computed(() => {
        const s = this.depsState();
        const deps: any = {};

        Object.keys(s).forEach(key => {
            const state = s[key];
            const options = state.accumulated().map((i: any) => ({ label: i.name, value: i.id }));
            const res = state.resource.value();
            if (res && state.page() < res.last_page) {
                options.push({ label: null, value: null });
            }
            // Map component-internal key back to config expected key (e.g., 'health_directorate_id' -> 'directorates')
            const configKey = this.getConfigKeyFromProp(key);
            deps[configKey] = options;
            deps[`is${configKey.charAt(0).toUpperCase() + configKey.slice(1)}Loading`] = state.resource.isLoading();
        });

        return this.config().formFields(deps);
    });

    private getConfigKeyFromProp(prop: string): string {
        const mapping: Record<string, string> = {
            health_directorate_id: 'directorates',
            health_division_id: 'healthDivisions',
            division_id: 'generalDivisions',
            authority_id: 'authorities'
        };
        return mapping[prop] || prop;
    }

    isSubmitting = signal(false);

    onDropdownSearch(event: { key: string; text: string }) {
        const state = this.depsState()[event.key];
        if (state) {
            state.searchTerm.set(event.text);
            state.page.set(1);
        }
    }

    onDropdownScroll(event: { key: string; event: any }) {
        const state = this.depsState()[event.key];
        if (!state || state.resource.isLoading()) return;

        const res = state.resource.value();
        const lastVisible = event.event.last;
        const currentCount = state.accumulated().length;

        if (res && lastVisible >= currentCount - 1 && state.page() < res.last_page) {
            state.page.update((p: number) => p + 1);
        }
    }

    onSubmit(formData: any): void {
        this.isSubmitting.set(true);
        const obs = this.isEdit()
            ? this._Service.updateEntity(this.config().endpoint, this.config().entity_type, this.id()!, formData)
            : this._Service.createEntity(this.config().endpoint, this.config().entity_type, formData);

        obs.subscribe({
            next: () => {
                this._MessageService.add({ summary: 'Success', detail: 'Saved successfully' });
                this.router.navigate([this.config().navPath]);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this._MessageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to save' });
            },
        });
    }

    onCancel(): void {
        this.router.navigate([this.config().navPath]);
    }
}
