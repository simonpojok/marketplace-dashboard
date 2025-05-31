import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {PromotionsService} from '../../services/promotions.service';
import {ToastService} from '../../../../core/services/toast.service';

interface PromotionUsage {
  id: string;
  campaign_name: string;
  promotion_name?: string;
  coupon_code?: string;
  user_name: string;
  user_phone: string;
  order_number: string;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  savings_percentage: number;
  created_at: string;
}

@Component({
  selector: 'app-promotion-usage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promotion-usage.component.html',
  styles: []
})
export class PromotionUsageComponent implements OnInit {
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  // Reactive state
  protected isLoading = signal(true);
  protected usageData = signal<PromotionUsage[]>([]);

  // Filters
  protected searchTerm = signal('');
  protected selectedCampaign = signal('');
  protected dateFrom = signal('');
  protected dateTo = signal('');

  ngOnInit(): void {
    this.loadUsageData();
  }

  protected loadUsageData(): void {
    this.isLoading.set(true);

    // Note: This would need to be implemented in the backend
    // For now, we'll simulate loading usage data
    setTimeout(() => {
      this.usageData.set([
        {
          id: '1',
          campaign_name: 'Black Friday Sale 2025',
          promotion_name: '50% OFF Electronics',
          coupon_code: undefined,
          user_name: 'John Doe',
          user_phone: '+256 772 123 456',
          order_number: 'ORD-001',
          discount_amount: 25000,
          original_amount: 50000,
          final_amount: 25000,
          savings_percentage: 50,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          campaign_name: 'New Customer Welcome',
          promotion_name: undefined,
          coupon_code: 'WELCOME15',
          user_name: 'Jane Smith',
          user_phone: '+256 703 456 789',
          order_number: 'ORD-002',
          discount_amount: 7500,
          original_amount: 50000,
          final_amount: 42500,
          savings_percentage: 15,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      this.isLoading.set(false);
    }, 1000);
  }

  protected onSearch(): void {
    this.loadUsageData();
  }

  protected onFilter(): void {
    this.loadUsageData();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCampaign.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.loadUsageData();
  }

  protected exportData(): void {
    const data = this.usageData();
    if (data.length === 0) {
      this.toastService.error('No data to export');
      return;
    }

    const csvContent = 'Date,Customer Name,Customer Phone,Campaign,Promotion/Coupon,Order Number,Original Amount,Discount Amount,Final Amount,Savings %\n' +
      data.map(usage =>
        `${this.formatDate(usage.created_at)},${usage.user_name},${usage.user_phone},${usage.campaign_name},"${usage.promotion_name || usage.coupon_code || 'N/A'}",${usage.order_number},${usage.original_amount},${usage.discount_amount},${usage.final_amount},${usage.savings_percentage}%`
      ).join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `promotion-usage-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastService.success('Usage data exported to CSV');
  }

  protected getTotalUses(): number {
    return this.usageData().length;
  }

  protected getTotalDiscount(): number {
    return this.usageData().reduce((total, usage) => total + usage.discount_amount, 0);
  }

  protected getAverageDiscount(): number {
    const data = this.usageData();
    if (data.length === 0) return 0;
    return this.getTotalDiscount() / data.length;
  }

  protected getUniqueUsers(): number {
    const uniqueUsers = new Set(this.usageData().map(usage => usage.user_phone));
    return uniqueUsers.size;
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
