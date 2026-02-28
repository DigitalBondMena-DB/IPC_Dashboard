import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface IHealthDirectorate {
  id: number;
  name: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HealthDirectorateService extends HttpService {
  getDirectorates(
    params: Signal<Record<string, string | number>>,
  ): HttpResourceRef<any | undefined> {
    const mergedParams = computed(() => ({
      ...params(),
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIRECTORATE,
    }));
    return this.get<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, mergedParams);
  }

  getDirectorateById(id: string): HttpResourceRef<IHealthDirectorate | undefined> {
    const params = computed(() => ({
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIRECTORATE,
    }));
    return this.get<IHealthDirectorate>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`, params);
  }

  createDirectorate(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, {
      ...data,
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIRECTORATE,
    });
  }

  updateDirectorate(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`,
      {
        ...data,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIRECTORATE,
      },
    );
  }

  toggleDirectorate(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}/toggle`, {
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HEALTH_DIRECTORATE,
    });
  }
}
