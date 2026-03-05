import { HttpService } from '@/core/services/http.service';
import { Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@/core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SurveyService extends HttpService {
  getSurveys(params: Signal<any>) {
    return this.get<any>(API_CONFIG.ENDPOINTS.SURVEYS.BASE, params);
  }

  duplicateSurvey(id: string | number): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${id}/duplicate`, {});
  }

  toggleSurvey(id: string | number): Observable<any> {
    return this.post<any>(`${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${id}/toggle`, {});
  }
}
