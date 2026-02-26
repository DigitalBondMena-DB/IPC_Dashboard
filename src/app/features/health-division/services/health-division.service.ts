import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';

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
  getDivisions(params: Signal<Record<string, string | number>>): HttpResourceRef<any | undefined> {
    return this.get<any>(API_CONFIG.ENDPOINTS.HEALTH_DIVISIONS, params);
  }

  getDivisionById(id: string): HttpResourceRef<IHealthDivision | undefined> {
    return this.get<IHealthDivision>(`${API_CONFIG.ENDPOINTS.HEALTH_DIVISIONS}/${id}`);
  }

  createDivision(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.HEALTH_DIVISIONS, data);
  }

  updateDivision(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH_DIVISIONS}/${id}`,
      data,
    );
  }

  toggleDivision(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.HEALTH_DIVISIONS}/${id}/toggle`, {});
  }
}
