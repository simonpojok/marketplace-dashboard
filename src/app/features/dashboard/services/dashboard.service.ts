import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}`;

  getDashboardData(): Observable<DashboardData> {
    // In a real app, we would make an HTTP request to an API endpoint
    // return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/summary`);

    // For now, let's return mock data with a delay to simulate network latency
    return of(this.getMockDashboardData()).pipe(
      delay(800) // Simulate network delay
    );
  }

  private getMockDashboardData(): DashboardData {
    return {
      summary: {
        totalSales: 2456789,
        salesChange: 12.5,
        totalOrders: 1245,
        ordersChange: 8.3,
        totalCustomers: 832,
        customersChange: 15.2,
        averageOrderValue: 1973,
        aovChange: 4.1
      },
      salesTrend: [
        { date: '2025-05-01', sales: 182500, orders: 85 },
        { date: '2025-05-02', sales: 196000, orders: 92 },
        { date: '2025-05-03', sales: 245000, orders: 110 },
        { date: '2025-05-04', sales: 208000, orders: 95 },
        { date: '2025-05-05', sales: 187500, orders: 88 },
        { date: '2025-05-06', sales: 176000, orders: 84 },
        { date: '2025-05-07', sales: 193000, orders: 91 },
        { date: '2025-05-08', sales: 210000, orders: 98 },
        { date: '2025-05-09', sales: 236000, orders: 105 },
        { date: '2025-05-10', sales: 267000, orders: 115 },
        { date: '2025-05-11', sales: 278000, orders: 118 },
        { date: '2025-05-12', sales: 263000, orders: 112 },
        { date: '2025-05-13', sales: 245000, orders: 108 },
        { date: '2025-05-14', sales: 238000, orders: 105 }
      ],
      topProducts: [
        {
          id: 'prod-1',
          name: 'Smartphone S21',
          category: 'Electronics',
          sales: 450000,
          quantity: 89,
          performance: 23.5
        },
        {
          id: 'prod-2',
          name: 'Wireless Earbuds',
          category: 'Electronics',
          sales: 320000,
          quantity: 256,
          performance: 15.8
        },
        {
          id: 'prod-3',
          name: 'Laptop Pro 15"',
          category: 'Electronics',
          sales: 289000,
          quantity: 32,
          performance: 10.2
        },
        {
          id: 'prod-4',
          name: 'Smart Watch 5',
          category: 'Electronics',
          sales: 210000,
          quantity: 105,
          performance: 8.7
        },
        {
          id: 'prod-5',
          name: 'Gaming Console X',
          category: 'Electronics',
          sales: 195000,
          quantity: 39,
          performance: 5.2
        }
      ],
      recentOrders: [
        {
          id: 'ord-1',
          orderNumber: 'AF2505ABC',
          customer: 'John Doe',
          date: '2025-05-20T10:15:30',
          total: 235000,
          status: 'processing',
          paymentMethod: 'mtn_mobile_money'
        },
        {
          id: 'ord-2',
          orderNumber: 'AF2505DEF',
          customer: 'Jane Smith',
          date: '2025-05-20T09:20:15',
          total: 48500,
          status: 'pending',
          paymentMethod: 'airtel_money'
        },
        {
          id: 'ord-3',
          orderNumber: 'AF2505GHI',
          customer: 'Michael Johnson',
          date: '2025-05-19T16:45:22',
          total: 158000,
          status: 'shipped',
          paymentMethod: 'bank_transfer'
        },
        {
          id: 'ord-4',
          orderNumber: 'AF2505JKL',
          customer: 'Robert Williams',
          date: '2025-05-19T14:12:40',
          total: 95000,
          status: 'delivered',
          paymentMethod: 'mtn_mobile_money'
        },
        {
          id: 'ord-5',
          orderNumber: 'AF2505MNO',
          customer: 'Sarah Brown',
          date: '2025-05-19T11:30:15',
          total: 180000,
          status: 'processing',
          paymentMethod: 'cash_on_delivery'
        },
        {
          id: 'ord-6',
          orderNumber: 'AF2505PQR',
          customer: 'David Miller',
          date: '2025-05-19T09:05:30',
          total: 72500,
          status: 'delivered',
          paymentMethod: 'airtel_money'
        },
        {
          id: 'ord-7',
          orderNumber: 'AF2505STU',
          customer: 'Emily Wilson',
          date: '2025-05-18T17:45:10',
          total: 125000,
          status: 'cancelled',
          paymentMethod: 'mtn_mobile_money'
        }
      ],
      topCustomers: [
        {
          id: 'cust-1',
          name: 'John Doe',
          phone: '+256 700 123 456',
          totalOrders: 8,
          totalSpent: 975000,
          lastOrderDate: '2025-05-20T10:15:30'
        },
        {
          id: 'cust-2',
          name: 'Sarah Brown',
          phone: '+256 701 234 567',
          totalOrders: 6,
          totalSpent: 820000,
          lastOrderDate: '2025-05-19T11:30:15'
        },
        {
          id: 'cust-3',
          name: 'Michael Johnson',
          phone: '+256 702 345 678',
          totalOrders: 5,
          totalSpent: 675000,
          lastOrderDate: '2025-05-19T16:45:22'
        },
        {
          id: 'cust-4',
          name: 'Emily Wilson',
          phone: '+256 703 456 789',
          totalOrders: 4,
          totalSpent: 520000,
          lastOrderDate: '2025-05-18T17:45:10'
        },
        {
          id: 'cust-5',
          name: 'David Miller',
          phone: '+256 704 567 890',
          totalOrders: 3,
          totalSpent: 410000,
          lastOrderDate: '2025-05-19T09:05:30'
        }
      ]
    };
  }
}
