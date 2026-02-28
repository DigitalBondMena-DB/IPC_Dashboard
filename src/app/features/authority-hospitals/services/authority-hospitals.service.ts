import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { computed, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface IAuthorityHospital {
  id: number;
  name: string;
  authority_id: number;
  division_id: number;
  authority_name?: string;
  division_name?: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthorityHospitalsService extends HttpService {
  getHospitals(params: Signal<Record<string, string | number>>): HttpResourceRef<any | undefined> {
    const mergedParams = computed(() => ({
      ...params(),
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY_HOSPITAL,
    }));
    return this.get<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, mergedParams);
  }

  getHospitalById(id: string): HttpResourceRef<IAuthorityHospital | undefined> {
    const params = computed(() => ({
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY_HOSPITAL,
    }));
    return this.get<IAuthorityHospital>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`, params);
  }

  createHospital(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.ENTITIES.BASE, {
      ...data,
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY_HOSPITAL,
    });
  }

  updateHospital(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}`,
      {
        ...data,
        type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY_HOSPITAL,
      },
    );
  }

  toggleHospital(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.ENTITIES.BASE}/${id}/toggle`, {
      type: API_CONFIG.ENDPOINTS.ENTITIES.TYPE.AUTHORITY_HOSPITAL,
    });
  }
}
