import { API_CONFIG } from '@/core/config/api.config';
import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { IDivision } from '../interfaces/division';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DivisionsService extends HttpService {
  getDivisions(
    params: Signal<Record<string, string | number>>,
  ): HttpResourceRef<IDivision | undefined> {
    return this.get<IDivision>(API_CONFIG.ENDPOINTS.CATEGORIES, params);
  }
  toggleDivision(id: string): Observable<IDivision> {
    return this.post<IDivision>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}/toggle`, {});
  }
  getDivisionById(id: string): HttpResourceRef<IDivision | undefined> {
    return this.get<IDivision>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  }
  createDivision(data: any): Observable<any> {
    return this.post<any>(API_CONFIG.ENDPOINTS.CATEGORIES, data);
  }
  updateDivision(id: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`,
      data,
    );
  }
}
