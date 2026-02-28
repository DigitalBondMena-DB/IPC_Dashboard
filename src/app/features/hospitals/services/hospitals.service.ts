import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface IHospital {
  id: number;
  name: string;
  health_directorate_id: number;
  health_division_id: number;
  division_id: number;
  health_directorate_name?: string;
  health_division_name?: string;
  division_name?: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HospitalsService extends HttpService {
  getHospitals(params: Signal<Record<string, string | number>>): HttpResourceRef<any | undefined> {
    const mergedParams = computed(() => ({
      ...params(),
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
    }));
    return this.get<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, mergedParams);
  }

  getHospitalById(id: string): HttpResourceRef<IHospital | undefined> {
    const params = computed(() => ({
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
    }));
    return this.get<IHospital>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`, params);
  }

  createHospital(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, {
      ...data,
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
    });
  }

  updateHospital(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`,
      {
        ...data,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
      },
    );
  }

  toggleHospital(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}/toggle`, {
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.HOSPITAL,
    });
  }
}
