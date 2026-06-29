import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject, of } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = `${API_BASE_URL}/auth`;

  // Signals for state management
  private userSignal = signal<User | null>(null);
  
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.userSignal.set(JSON.parse(storedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(res => {
        // Cookies are updated automatically
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  updateTargets(targets: { applications: number; outreach: number; connections: number }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/targets`, targets).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.userSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.userSignal.set(null);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        localStorage.removeItem('user');
        this.userSignal.set(null);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private handleAuthSuccess(res: AuthResponse) {
    if (res.success) {
      localStorage.setItem('user', JSON.stringify(res.user));
      this.userSignal.set(res.user);
    }
  }
}
