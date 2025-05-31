import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {PromotionsService} from '../../services/promotions.service';
import {ToastService} from '../../../../core/services/toast.service';
import {CouponCreateRequest, CouponType} from '../../models/coupon.model';

@Component({
  selector: 'app-coupon-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coupon-create.component.html',
  styles: []
})
export class CouponCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isSubmitting = signal(false);
  protected selectedCouponType = signal<CouponType | ''>('');

  protected couponTypeOptions = [
    {value: 'single_use', label: 'Single Use - Can only be used once total'},
    {value: 'multi_use', label: 'Multi Use - Can be used multiple times'},
    {value: 'user_specific', label: 'User Specific - Only for a specific user'}
  ];

  protected couponForm = this.fb.group({
    campaign: ['', Validators.required],
    code: [''],
    coupon_type: ['', Validators.required],
    max_uses: [null as number | null],
    max_uses_per_user: [1, [Validators.required, Validators.min(1)]],
    specific_user: [null as string | null],
    is_active: [true]
  });

  ngOnInit(): void {
    // Check if campaign ID is provided in query params
    const campaignId = this.route.snapshot.queryParamMap.get('campaign');
    if (campaignId) {
      this.couponForm.patchValue({campaign: campaignId});
    }
  }

  protected onCouponTypeChange(): void {
    const couponType = this.couponForm.get('coupon_type')?.value as CouponType;
    this.selectedCouponType.set(couponType);

    // Update validators based on coupon type
    const specificUserControl = this.couponForm.get('specific_user');
    if (couponType === 'user_specific') {
      specificUserControl?.setValidators([Validators.required]);
    } else {
      specificUserControl?.setValidators([]);
      specificUserControl?.setValue(null);
    }
    specificUserControl?.updateValueAndValidity();

    // Update max uses based on type
    if (couponType === 'single_use') {
      this.couponForm.patchValue({max_uses: 1});
    }
  }

  protected onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.couponForm.patchValue({code: input.value});
  }

  protected generateCode(): void {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.couponForm.patchValue({code: result});
  }

  protected getPreviewCode(): string {
    const code = this.couponForm.get('code')?.value;
    return code || 'AUTO-GENERATED';
  }

  protected getPreviewDescription(): string {
    const type = this.selectedCouponType();
    switch (type) {
      case 'single_use':
        return 'Single Use Coupon';
      case 'multi_use':
        return 'Multi Use Coupon';
      case 'user_specific':
        return 'User Specific Coupon';
      default:
        return 'Coupon Code';
    }
  }

  protected getPreviewUsageInfo(): string {
    const maxUses = this.couponForm.get('max_uses')?.value;
    const maxUsesPerUser = this.couponForm.get('max_uses_per_user')?.value;

    let info = `Max ${maxUsesPerUser} use${maxUsesPerUser === 1 ? '' : 's'} per user`;
    if (maxUses) {
      info += ` • ${maxUses} total use${maxUses === 1 ? '' : 's'}`;
    }

    return info;
  }

  protected onSubmit(): void {
    if (this.couponForm.valid) {
      this.isSubmitting.set(true);

      const formData = this.couponForm.value as CouponCreateRequest;

      this.promotionsService.createCoupon(formData).subscribe({
        next: (coupon) => {
          this.toastService.success('Coupon created successfully');
          this.router.navigate(['/promotions/coupons', coupon.id]);
        },
        error: (error) => {
          console.error('Error creating coupon:', error);
          this.toastService.error(error.error?.message || 'Failed to create coupon');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/promotions/coupons']);
  }
}
