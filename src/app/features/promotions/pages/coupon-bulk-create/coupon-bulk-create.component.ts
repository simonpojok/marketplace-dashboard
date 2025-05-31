import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {PromotionsService} from '../../services/promotions.service';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-coupon-bulk-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coupon-bulk-create.component.html',
  styles: []
})
export class CouponBulkCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isSubmitting = signal(false);
  protected createdCoupons = signal<any[]>([]);

  protected couponTypeOptions = [
    {value: 'multi_use', label: 'Multi Use'},
    {value: 'single_use', label: 'Single Use'}
  ];

  protected bulkCreateForm = this.fb.group({
    campaign: ['', Validators.required],
    count: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    coupon_type: ['multi_use'],
    max_uses: [null as number | null],
    max_uses_per_user: [1, [Validators.required, Validators.min(1)]],
    prefix: ['']
  });

  ngOnInit(): void {
    // Check if campaign ID is provided in query params
    const campaignId = this.route.snapshot.queryParamMap.get('campaign');
    if (campaignId) {
      this.bulkCreateForm.patchValue({campaign: campaignId});
    }
  }

  protected onPrefixInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.bulkCreateForm.patchValue({prefix: input.value});
  }

  protected getCodePreview(): string {
    const prefix = this.bulkCreateForm.get('prefix')?.value || '';
    return prefix ? `${prefix}XXXX` : 'XXXXXXXX';
  }

  protected getCouponTypeLabel(): string {
    const type = this.bulkCreateForm.get('coupon_type')?.value;
    return this.couponTypeOptions.find(opt => opt.value === type)?.label || 'Multi Use';
  }

  protected getTotalPossibleUses(): number {
    const count = this.bulkCreateForm.get('count')?.value || 0;
    const maxUsesPerUser = this.bulkCreateForm.get('max_uses_per_user')?.value || 1;
    const maxUses = this.bulkCreateForm.get('max_uses')?.value;

    if (maxUses) {
      return Math.min(count * maxUses, count * maxUsesPerUser * 1000); // Assume max 1000 users per coupon
    } else {
      return count * maxUsesPerUser * 1000; // Assume unlimited with 1000 users
    }
  }

  protected onSubmit(): void {
    if (this.bulkCreateForm.valid) {
      this.isSubmitting.set(true);

      const formData = this.bulkCreateForm.value;

      // @ts-ignore
      this.promotionsService.createBulkCoupons(formData).subscribe({
        next: (response) => {
          this.createdCoupons.set(response.coupons);
          this.toastService.success(response.message);
          this.isSubmitting.set(false);

          // Scroll to success message
          setTimeout(() => {
            const successElement = document.querySelector('.bg-green-50');
            successElement?.scrollIntoView({behavior: 'smooth'});
          }, 100);
        },
        error: (error) => {
          console.error('Error creating bulk coupons:', error);
          this.toastService.error(error.error?.message || 'Failed to create coupons');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  protected exportCoupons(): void {
    const coupons = this.createdCoupons();
    if (coupons.length === 0) return;

    const csvContent = 'Coupon Code,Campaign,Type,Max Uses,Max Uses Per User,Status\n' +
      coupons.map(coupon =>
        `${coupon.code},${coupon.campaign_name},${coupon.coupon_type_display},${coupon.max_uses || 'Unlimited'},${coupon.max_uses_per_user},${coupon.is_active ? 'Active' : 'Inactive'}`
      ).join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `coupons-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastService.success('Coupons exported to CSV');
  }

  protected onCancel(): void {
    this.router.navigate(['/promotions/coupons']);
  }
}
