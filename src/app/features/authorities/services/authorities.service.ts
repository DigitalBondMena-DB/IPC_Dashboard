import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface IAuthority {
  id: number;
  name: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthoritiesService extends HttpService {
  getAuthorities(
    params: Signal<Record<string, string | number>>,
  ): HttpResourceRef<any | undefined> {
    return this.get<any>(API_CONFIG.ENDPOINTS.AUTHORITIES, params);
  }

  getAuthorityById(id: string): HttpResourceRef<IAuthority | undefined> {
    return this.get<IAuthority>(`${API_CONFIG.ENDPOINTS.AUTHORITIES}/${id}`);
  }

  createAuthority(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.AUTHORITIES, data);
  }

  updateAuthority(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTHORITIES}/${id}`,
      data,
    );
  }

  toggleAuthority(id: string): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.AUTHORITIES}/${id}/toggle`, {});
  }
}
