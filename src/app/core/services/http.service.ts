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
  get<T>(endpoint: string, params?: Signal<any>): HttpResourceRef<T | undefined> {
    return httpResource<T>(() => ({
      url: API_CONFIG.BASE_URL + endpoint,
      method: 'GET',
      params: params?.(),
    }));
  }
}
