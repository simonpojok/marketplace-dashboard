import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../models/auth.model';
import { User } from '../models/user.model';
import {Tokens} from '../models/tokens.model';
import {UserProfile} from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}`;
  private tokenKey = environment.tokenKey;

  // Use signals for reactive state management
  private userProfile = signal<UserProfile | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isLoadingSignal = signal<boolean>(false);

  // Expose read-only signals
  readonly profile = this.userProfile.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    this.checkAuth();
  }


  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/users/login/`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register/`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
  }

  logout(): Observable<{ message: string }> {
    this.isLoadingSignal.set(true);
    const refresh = this.getRefreshToken();

    // If no refresh token, just clear auth state
    if (!refresh) {
      this.clearAuthState();
      return of({ message: 'Logged out successfully' });
    }

    // Otherwise, blacklist the token on the server
    return this.http.post<{ message: string }>(`${this.apiUrl}/users/logout/`, { refresh }).pipe(
      tap(() => this.clearAuthState()),
      catchError(error => {
        // Even if the server request fails, clear local auth state
        this.clearAuthState();
        return of({ message: 'Logged out locally' });
      })
    );
  }

  refreshToken(): Observable<Tokens> {
    const refresh = this.getRefreshToken();

    if (!refresh) {
      this.clearAuthState();
      throw new Error('No refresh token available');
    }

    return this.http.post<Tokens>(`${this.apiUrl}/users/token/refresh/`, { refresh }).pipe(
      tap(tokens => {
        this.storeTokens(tokens);
      }),
      catchError(error => {
        this.clearAuthState();
        throw error;
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/profile/`).pipe(
      tap(user => {
        this.userProfile.set(user);
      })
    );
  }

  getAccessToken(): string | null {
    const tokensJson = localStorage.getItem(this.tokenKey);
    if (!tokensJson) return null;

    try {
      const tokens: Tokens = JSON.parse(tokensJson);
      return tokens.access;
    } catch (e) {
      this.clearAuthState();
      return null;
    }
  }

  private getRefreshToken(): string | null {
    const tokensJson = localStorage.getItem(this.tokenKey);
    if (!tokensJson) return null;

    try {
      const tokens: Tokens = JSON.parse(tokensJson);
      return tokens.refresh;
    } catch (e) {
      this.clearAuthState();
      return null;
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    const { access, refresh, user } = response;
    this.storeTokens({ access, refresh });
    this.userProfile.set(user);
    this.isAuthenticatedSignal.set(true);
    this.isLoadingSignal.set(false);
    this.router.navigate(['/dashboard']).then(console.log);
  }

  private storeTokens(tokens: Tokens): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(tokens));
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.tokenKey);
    this.userProfile.set(null);
    this.isAuthenticatedSignal.set(false);
    this.isLoadingSignal.set(false);
    this.router.navigate(['/auth/login']).then(console.log);
  }

  private checkAuth(): void {
    const token = this.getAccessToken();
    if (token) {
      this.isAuthenticatedSignal.set(true);
      // this.getProfile().subscribe();
    }
  }

  refreshProfile(): void {
    this.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile refreshed successfully');
      },
      error: (error) => {
        console.error('Error refreshing profile:', error);
      }
    });
  }
}
