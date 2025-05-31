import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {PromotionsService} from '../../services/promotions.service';
import {ToastService} from '../../../../core/services/toast.service';
import {Coupon} from '../../models/coupon.model';

@Component({
  selector: 'app-coupon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './coupon-detail.component.html',
  styles: []
})
export class CouponDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isLoading = signal(true);
  protected coupon = signal<Coupon | null>(null);

  ngOnInit(): void {
    const couponId = this.route.snapshot.paramMap.get('id');
    if (couponId) {
      this.loadCoupon(couponId);
    }
  }

  private loadCoupon(id: string): void {
    this.promotionsService.getCoupon(id).subscribe({
      next: (coupon) => {
        this.coupon.set(coupon);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading coupon:', error);
        this.toastService.error('Failed to load coupon');
        this.router.navigate(['/promotions/coupons']);
      }
    });
  }

  protected copyCouponCode(): void {
    const code = this.coupon()?.code;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        this.toastService.success('Coupon code copied to clipboard');
      }).catch(() => {
        this.toastService.error('Failed to copy coupon code');
      });
    }
  }

  protected getUsagePercentage(): number {
    const coupon = this.coupon();
    if (!coupon?.max_uses) return 0;
    return Math.round((coupon.usage_count / coupon.max_uses) * 100);
  }

  protected getRemainingUses(): number {
    const coupon = this.coupon();
    if (!coupon?.max_uses) return 0;
    return Math.max(0, coupon.max_uses - coupon.usage_count);
  }

  protected toggleCouponStatus(): void {
    const coupon = this.coupon();
    if (!coupon) return;

    const action = coupon.is_active ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this coupon?`)) {
      const updatedData = {is_active: !coupon.is_active};

      this.promotionsService.updateCoupon(coupon.id, updatedData).subscribe({
        next: (updatedCoupon) => {
          this.coupon.set(updatedCoupon);
          this.toastService.success(`Coupon ${action}d successfully`);
        },
        error: (error) => {
          console.error('Error updating coupon:', error);
          this.toastService.error(`Failed to ${action} coupon`);
        }
      });
    }
  }

  protected duplicateCoupon(): void {
    const coupon = this.coupon();
    if (!coupon) return;

    if (confirm(`Create a copy of coupon "${coupon.code}"?`)) {
      const duplicateData = {
        campaign: coupon.campaign,
        coupon_type: coupon.coupon_type,
        max_uses: coupon.max_uses,
        max_uses_per_user: coupon.max_uses_per_user,
        specific_user: coupon.specific_user,
        is_active: false // Create as inactive
      };

      this.promotionsService.createCoupon(duplicateData).subscribe({
        next: (newCoupon) => {
          this.toastService.success('Coupon duplicated successfully');
          this.router.navigate(['/promotions/coupons', newCoupon.id]);
        },
        error: (error) => {
          console.error('Error duplicating coupon:', error);
          this.toastService.error('Failed to duplicate coupon');
        }
      });
    }
  }

  protected deleteCoupon(): void {
    const coupon = this.coupon();
    if (!coupon) return;

    if (confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      this.promotionsService.deleteCoupon(coupon.id).subscribe({
        next: () => {
          this.toastService.success('Coupon deleted successfully');
          this.router.navigate(['/promotions/coupons']);
        },
        error: (error) => {
          console.error('Error deleting coupon:', error);
          this.toastService.error('Failed to delete coupon');
        }
      });
    }
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getCouponTypeClass(type: string): string {
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
