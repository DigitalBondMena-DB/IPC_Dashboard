import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
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
    return this.get<any>(API_CONFIG.ENDPOINTS.HEALTH_DIRECTORATES, params);
  }

  getDirectorateById(id: string): HttpResourceRef<IHealthDirectorate | undefined> {
    return this.get<IHealthDirectorate>(`${API_CONFIG.ENDPOINTS.HEALTH_DIRECTORATES}/${id}`);
  }

  createDirectorate(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.HEALTH_DIRECTORATES, data);
  }

  updateDirectorate(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH_DIRECTORATES}/${id}`,
      data,
    );
  }

  toggleDirectorate(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.HEALTH_DIRECTORATES}/${id}/toggle`, {});
  }
}
