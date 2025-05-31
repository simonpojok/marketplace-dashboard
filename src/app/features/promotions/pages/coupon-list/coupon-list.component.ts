import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {PromotionsService} from '../../services/promotions.service';
import {Coupon, CouponType} from '../../models/campaign.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './coupon-list.component.html',
  styles: []
})
export class CouponListComponent implements OnInit {
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  // Reactive state
  protected isLoading = signal(true);
  protected coupons = signal<Coupon[]>([]);

  // Filters
  protected searchTerm = signal('');
  protected selectedCampaign = signal('');
  protected selectedCouponType = signal<CouponType | ''>('');
  protected selectedStatus = signal('');

  // Options
  protected couponTypeOptions = [
    {value: 'single_use', label: 'Single Use'},
    {value: 'multi_use', label: 'Multi Use'},
    {value: 'user_specific', label: 'User Specific'}
  ];

  ngOnInit(): void {
    this.loadCoupons();
  }

  protected loadCoupons(): void {
    this.isLoading.set(true);

    // Build filter params
    const params: any = {};
    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedCampaign()) params.campaign = this.selectedCampaign();
    if (this.selectedCouponType()) params.coupon_type = this.selectedCouponType();
    if (this.selectedStatus()) params.is_active = this.selectedStatus() === 'true';

    this.promotionsService.getCoupons().subscribe({
      next: (coupons) => {
        this.coupons.set(coupons);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading coupons:', error);
        this.toastService.error('Failed to load coupons');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    this.loadCoupons();
  }

  protected onFilter(): void {
    this.loadCoupons();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCampaign.set('');
    this.selectedCouponType.set('');
    this.selectedStatus.set('');
    this.loadCoupons();
  }

  protected copyCouponCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success('Coupon code copied to clipboard');
    }).catch(() => {
      this.toastService.error('Failed to copy coupon code');
    });
  }

  protected deleteCoupon(coupon: Coupon): void {
    if (confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      this.promotionsService.deleteCoupon(coupon.id).subscribe({
        next: () => {
          this.toastService.success('Coupon deleted successfully');
          this.loadCoupons();
        },
        error: (error) => {
          console.error('Error deleting coupon:', error);
          this.toastService.error('Failed to delete coupon');
        }
      });
    }
  }

  protected getCouponTypeClass(type: CouponType): string {
    switch (type) {
      case 'single_use':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'multi_use':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'user_specific':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}
