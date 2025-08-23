import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {environment} from '../../../environments/environment';

export interface UserProfile {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  address: string;
  date_joined: string;
  is_active: boolean;
  is_verified: boolean;
  profile: {
    id: string;
    bio: string;
    avatar: string | null;
    date_of_birth: string | null;
    gender: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    timezone: string;
    language: string;
    is_public: boolean;
    show_email: boolean;
    show_phone: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  address?: string;
  profile?: {
    bio?: string;
    date_of_birth?: string;
    gender?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    timezone?: string;
    language?: string;
    is_public?: boolean;
    show_email?: boolean;
    show_phone?: boolean;
  };
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${environment.apiVersion}/users`;

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile/`).pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile (alternative endpoint)
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me/`).pipe(
      catchError(error => {
        console.error('Error fetching current user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: UpdateUserProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/profile/`, data).pipe(
      tap(response => {
        console.log('Profile updated successfully:', response);
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/change-password/`, data).pipe(
      tap(response => {
        console.log('Password changed successfully:', response);
      }),
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload profile avatar
   */
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post(`${this.baseUrl}/upload-avatar/`, formData).pipe(
      tap(response => {
        console.log('Avatar uploaded successfully:', response);
      }),
      catchError(error => {
        console.error('Error uploading avatar:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove profile avatar
   */
  removeAvatar(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove-avatar/`).pipe(
      tap(response => {
        console.log('Avatar removed successfully:', response);
      }),
      catchError(error => {
        console.error('Error removing avatar:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete user account
   */
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-account/`).pipe(
      tap(response => {
        console.log('Account deleted successfully:', response);
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Request password reset
   */
  requestPasswordReset(phoneNumber: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password-request/`, { phone_number: phoneNumber }).pipe(
      tap(response => {
        console.log('Password reset requested:', response);
      }),
      catchError(error => {
        console.error('Error requesting password reset:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirm password reset
   */
  confirmPasswordReset(data: {
    phone_number: string;
    verification_code: string;
    new_password: string;
    new_password_confirm: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password-confirm/`, data).pipe(
      tap(response => {
        console.log('Password reset confirmed:', response);
      }),
      catchError(error => {
        console.error('Error confirming password reset:', error);
        return throwError(() => error);
      })
    );
  }
}
