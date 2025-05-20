import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { SalesTrendComponent } from './components/sales-trend/sales-trend.component';
import {RecentOrdersComponent} from './components/recent-orders/recent-orders.component';
import {ProductPerformanceComponent} from './components/product-performance/product-performance';
import {TopCustomersComponent} from './components/top-customers/top-customers.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsCardComponent,
    RecentOrdersComponent,
    SalesTrendComponent,
    ProductPerformanceComponent,
    TopCustomersComponent
  ],
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected dashboardData = signal<any | null>(null);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  protected refreshData(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading.set(false);
      }
    });
  }
}
