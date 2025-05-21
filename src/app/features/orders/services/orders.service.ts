import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Order, OrderFilterParams, OrderUpdateParams} from '../models/order.model';
import {OrderListResponse} from '../models/order-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/orders`;

  getOrders(params?: OrderFilterParams): Observable<OrderListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof OrderFilterParams] !== undefined && params[key as keyof OrderFilterParams] !== null) {
          httpParams = httpParams.set(key, String(params[key as keyof OrderFilterParams]));
        }
      });
    }

    return this.http.get<OrderListResponse>(`${this.apiUrl}/orders/`, {params: httpParams});
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}/`);
  }

  updateOrder(id: string, data: OrderUpdateParams): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/`, data);
  }

  trackOrder(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/orders/${id}/track/`);
  }

  // Helper functions to get orders by status
  getPendingOrders(): Observable<OrderListResponse> {
    return this.getOrders({status: 'pending'});
  }

  getProcessingOrders(): Observable<OrderListResponse> {
    return this.getOrders({status: 'processing'});
  }

  getShippedOrders(): Observable<OrderListResponse> {
    return this.getOrders({status: 'shipped'});
  }

  getDeliveredOrders(): Observable<OrderListResponse> {
    return this.getOrders({status: 'delivered'});
  }

  getCancelledOrders(): Observable<OrderListResponse> {
    return this.getOrders({status: 'cancelled'});
  }
}
