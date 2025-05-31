import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminUser,
  AdminUserDetail,
  AdminUserListResponse,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  ChangePasswordRequest,
  PermissionGroup,
  ActivityLogResponse
} from '../models/admin-user.model';

export interface AdminUserFilters {
  search?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/users/admin-users`;

  /**
   * Get list of admin users with filtering and pagination
   */
  getAdminUsers(filters: AdminUserFilters = {}): Observable<AdminUserListResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof AdminUserFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<AdminUserListResponse>(this.apiUrl, { params });
  }

  /**
   * Get detailed information about a specific admin user
   */
  getAdminUser(id: string): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Create a new admin user
   */
  createAdminUser(userData: CreateAdminUserRequest): Observable<{ message: string; user: AdminUserDetail }> {
    return this.http.post<{ message: string; user: AdminUserDetail }>(this.apiUrl, userData);
  }

  /**
   * Update an existing admin user
   */
  updateAdminUser(id: string, userData: UpdateAdminUserRequest): Observable<{ message: string; user: AdminUserDetail }> {
    return this.http.patch<{ message: string; user: AdminUserDetail }>(`${this.apiUrl}/${id}/`, userData);
  }

  /**
   * Deactivate an admin user (soft delete)
   */
  deleteAdminUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/`);
  }

  /**
   * Change password for an admin user
   */
  changePassword(id: string, passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/change_password/`, passwordData);
  }

  /**
   * Activate a deactivated admin user
   */
  activateAdminUser(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/activate/`, {});
  }

  /**
   * Deactivate an admin user
   */
  deactivateAdminUser(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/deactivate/`, {});
  }

  /**
   * Get available permissions grouped by model
   */
  getPermissions(): Observable<PermissionGroup> {
    return this.http.get<PermissionGroup>(`${this.apiUrl}/permissions/`);
  }

  /**
   * Get recent activity log for admin users
   */
  getActivityLog(): Observable<ActivityLogResponse> {
    return this.http.get<ActivityLogResponse>(`${this.apiUrl}/activity_log/`);
  }

  /**
   * Search admin users
   */
  searchAdminUsers(query: string): Observable<AdminUserListResponse> {
    return this.getAdminUsers({ search: query });
  }

  /**
   * Export admin users data (could be CSV, Excel, etc.)
   */
  exportAdminUsers(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/`, {
      params: { format },
      responseType: 'blob'
    });
  }

  /**
   * Get admin user statistics for dashboard
   */
  getAdminUserStats(): Observable<{
    total_admins: number;
    active_admins: number;
    superusers: number;
    inactive_admins: number;
    recent_logins: number;
    new_this_month: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats/`);
  }

  /**
   * Bulk operations on admin users
   */
  bulkUpdateAdminUsers(userIds: string[], action: 'activate' | 'deactivate', data?: any): Observable<{ message: string; updated_count: number }> {
    return this.http.post<{ message: string; updated_count: number }>(`${this.apiUrl}/bulk_update/`, {
      user_ids: userIds,
      action,
      data
    });
  }
}
