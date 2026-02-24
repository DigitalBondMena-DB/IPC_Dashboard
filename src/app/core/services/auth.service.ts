import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _Router = inject(Router);
  private readonly TOKEN_STORAGE = 'userToken';
  private _token = signal<string | null>(null);
  public token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._token());
  constructor() {
    this.initializeFromStorage();
  }
  private initializeFromStorage(): void {
    const storedToken = localStorage.getItem(this.TOKEN_STORAGE);
    if (storedToken) {
      this._token.set(storedToken);
    }
  }
  setToken(token: string): void {
    this._token.set(token);
    localStorage.setItem(this.TOKEN_STORAGE, token);
  }
  clearToken(): void {
    this._token.set(null);
    localStorage.removeItem(this.TOKEN_STORAGE);
  }
  logout(): void {
    this.clearToken();
    this._Router.navigate(['/login']);
  }
}
