import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {PromotionsService} from '../../services/promotions.service';
import {ToastService} from '../../../../core/services/toast.service';
import {ApplyTo, DiscountType, PromotionCreateRequest} from '../../models/promotion.model';

@Component({
  selector: 'app-promotion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotion-create.component.html',
  styles: []
})
export class PromotionCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isSubmitting = signal(false);
  protected selectedDiscountType = signal<DiscountType | ''>('');
  protected selectedApplyTo = signal<ApplyTo | ''>('');

  protected discountTypeOptions = [
    {value: 'percentage', label: 'Percentage Discount'},
    {value: 'fixed_amount', label: 'Fixed Amount Discount'},
    {value: 'buy_x_get_y', label: 'Buy X Get Y'},
    {value: 'free_shipping', label: 'Free Shipping'}
  ];

  protected applyToOptions = [
    {value: 'order', label: 'Entire Order'},
    {value: 'products', label: 'Specific Products'},
    {value: 'categories', label: 'Specific Categories'},
    {value: 'brands', label: 'Specific Brands'}
  ];

  protected promotionForm = this.fb.group({
    campaign: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    discount_type: ['', Validators.required],
    discount_value: [0, [Validators.required, Validators.min(0)]],
    max_discount_amount: [null as number | null],
    apply_to: ['', Validators.required],
    products: [[] as string[]],
    categories: [[] as string[]],
    brands: [[] as string[]],
    buy_quantity: [null as number | null],
    get_quantity: [null as number | null],
    get_discount_percentage: [null as number | null],
    minimum_quantity: [null as number | null],
    minimum_amount: [null as number | null],
    priority: [0],
    is_active: [true],
    is_stackable: [false]
  });

  ngOnInit(): void {
    // Check if campaign ID is provided in query params
    const campaignId = this.route.snapshot.queryParamMap.get('campaign');
    if (campaignId) {
      this.promotionForm.patchValue({campaign: campaignId});
    }
  }

  protected onDiscountTypeChange(): void {
    const discountType = this.promotionForm.get('discount_type')?.value as DiscountType;
    this.selectedDiscountType.set(discountType);

    // Reset related fields
    this.promotionForm.patchValue({
      discount_value: discountType === 'free_shipping' ? 0 : null,
      buy_quantity: null,
      get_quantity: null,
      get_discount_percentage: null
    });

    // Update validators based on discount type
    const discountValueControl = this.promotionForm.get('discount_value');
    if (discountType === 'percentage') {
      discountValueControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else if (discountType === 'free_shipping') {
      discountValueControl?.setValidators([]);
    } else {
      discountValueControl?.setValidators([Validators.required, Validators.min(0)]);
    }
    discountValueControl?.updateValueAndValidity();
  }

  protected onApplyToChange(): void {
    const applyTo = this.promotionForm.get('apply_to')?.value as ApplyTo;
    this.selectedApplyTo.set(applyTo);

    // Reset selection arrays
    this.promotionForm.patchValue({
      products: [],
      categories: [],
      brands: []
    });
  }

  protected showDiscountValue(): boolean {
    return this.selectedDiscountType() !== 'free_shipping';
  }

  protected getDiscountValueLabel(): string {
    switch (this.selectedDiscountType()) {
      case 'percentage':
        return 'Percentage (0-100)';
      case 'fixed_amount':
        return 'Amount in UGX';
      case 'buy_x_get_y':
        return 'Not applicable';
      default:
        return '';
    }
  }

  protected getDiscountValueMax(): number | null {
    return this.selectedDiscountType() === 'percentage' ? 100 : null;
  }

  protected getDiscountValuePlaceholder(): string {
    switch (this.selectedDiscountType()) {
      case 'percentage':
        return 'e.g., 15';
      case 'fixed_amount':
        return 'e.g., 5000';
      default:
        return '';
    }
  }

  protected onSubmit(): void {
    if (this.promotionForm.valid) {
      this.isSubmitting.set(true);

      const formData = this.promotionForm.value as PromotionCreateRequest;

      this.promotionsService.createPromotion(formData).subscribe({
        next: (promotion) => {
          this.toastService.success('Promotion created successfully');
          this.router.navigate(['/promotions/promotions', promotion.id]);
        },
        error: (error) => {
          console.error('Error creating promotion:', error);
          this.toastService.error(error.error?.message || 'Failed to create promotion');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/promotions/promotions']);
  }
}
