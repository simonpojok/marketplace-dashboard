import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}`;

  getDashboardData(): Observable<DashboardData> {
    // Make HTTP request to the real API endpoint - using proper analytics endpoint from backend
    return this.http.get<DashboardData>(`${this.apiUrl}/users/customers-overview/`);
  }
}
