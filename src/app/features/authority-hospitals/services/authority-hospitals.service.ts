import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
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
    return this.get<any>(API_CONFIG.ENDPOINTS.AUTHORITY_HOSPITALS, params);
  }

  getHospitalById(id: string): HttpResourceRef<IAuthorityHospital | undefined> {
    return this.get<IAuthorityHospital>(`${API_CONFIG.ENDPOINTS.AUTHORITY_HOSPITALS}/${id}`);
  }

  createHospital(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.AUTHORITY_HOSPITALS, data);
  }

  updateHospital(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTHORITY_HOSPITALS}/${id}`,
      data,
    );
  }

  toggleHospital(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.AUTHORITY_HOSPITALS}/${id}/toggle`, {});
  }
}
