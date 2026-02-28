import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { IHealthDivisionResponse } from '../interfaces/health-division';

export interface IHealthDivision {
  id: number;
  name: string;
  health_directorate_id: number;
  health_directorate_name?: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HealthDivisionService extends HttpService {
  getDivisions(params: Signal<Record<string, string | number>>): HttpResourceRef<IHealthDivisionResponse | undefined> {
    const mergedParams = computed(() => ({
      ...params(),
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIVISION,
    }));
    return this.get<IHealthDivisionResponse | undefined>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, mergedParams);
  }

  getDivisionById(id: string): HttpResourceRef<IHealthDivision | undefined> {
    const params = computed(() => ({
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIVISION,
    }));
    return this.get<IHealthDivision>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`, params);
  }

  createDivision(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, {
      ...data,
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIVISION,
    });
  }

  updateDivision(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`,
      {
        ...data,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIVISION,
      },
    );
  }

  toggleDivision(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}/toggle`, {
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIVISION,
    });
  }
}
