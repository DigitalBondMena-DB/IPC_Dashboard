import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
}
