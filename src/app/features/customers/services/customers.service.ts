import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Customer, CustomerListResponse, CustomerOrdersResponse} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/users`;

  getCustomers(params?: any): Observable<CustomerListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<CustomerListResponse>(`${this.apiUrl}/customers/`, {params: httpParams});
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}/`);
  }

  getCustomerOrders(id: string, params?: any): Observable<CustomerOrdersResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<CustomerOrdersResponse>(`${this.apiUrl}/customers/${id}/orders/`, {params: httpParams});
  }

  updateCustomer(id: string, data: Partial<Customer>): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/customers/${id}/`, data);
  }

  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers/search/`, {params: {q: query}});
  }
}
