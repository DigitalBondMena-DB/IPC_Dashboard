import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  public http = inject(HttpClient);

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(API_CONFIG.BASE_URL + endpoint, data);
  }
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(API_CONFIG.BASE_URL + endpoint);
  }
  get<T>(endpoint: string, params?: Signal<any>): HttpResourceRef<T | undefined> {
    return httpResource<T>(() => {
      // نتحقق من وجود الـ endpoint والـ params بشكل منعزل لضمان الاستقرار
      const currentParams = params ? params() : {};
      
      if (!endpoint) return undefined;

      return {
        url: API_CONFIG.BASE_URL + endpoint,
        method: 'GET',
        params: currentParams,
      };
    });
  }
}
