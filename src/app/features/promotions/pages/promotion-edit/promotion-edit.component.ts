import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PromotionsService } from '../../services/promotions.service';
import { ToastService } from '../../../../core/services/toast.service';
import {ApplyTo, DiscountType, Promotion, PromotionCreateRequest} from '../../models/promotion.model';

@Component({
  selector: 'app-promotion-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotion-edit.component.html',
  styles: []
})
export class PromotionEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isLoading = signal(true);
  protected isSubmitting = signal(false);
  protected promotion = signal<Promotion | null>(null);
  protected selectedDiscountType = signal<DiscountType | ''>('');
  protected selectedApplyTo = signal<ApplyTo | ''>('');

  protected discountTypeOptions = [
    { value: 'percentage', label: 'Percentage Discount' },
    { value: 'fixed_amount', label: 'Fixed Amount Discount' },
    { value: 'buy_x_get_y', label: 'Buy X Get Y' },
    { value: 'free_shipping', label: 'Free Shipping' }
  ];

  protected applyToOptions = [
    { value: 'order', label: 'Entire Order' },
    { value: 'products', label: 'Specific Products' },
    { value: 'categories', label: 'Specific Categories' },
    { value: 'brands', label: 'Specific Brands' }
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
    const promotionId = this.route.snapshot.paramMap.get('id');
    if (promotionId) {
      this.loadPromotion(promotionId);
    }
  }

  private loadPromotion(id: string): void {
    this.promotionsService.getPromotion(id).subscribe({
      next: (promotion) => {
        this.promotion.set(promotion);
        this.populateForm(promotion);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading promotion:', error);
        this.toastService.error('Failed to load promotion');
        this.router.navigate(['/promotions/promotions']);
      }
    });
  }

  private populateForm(promotion: Promotion): void {
    this.selectedDiscountType.set(promotion.discount_type);
    this.selectedApplyTo.set(promotion.apply_to);

    this.promotionForm.patchValue({
      campaign: promotion.campaign,
      name: promotion.name,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      max_discount_amount: promotion.max_discount_amount,
      apply_to: promotion.apply_to,
      products: promotion.products,
      categories: promotion.categories,
      brands: promotion.brands,
      buy_quantity: promotion.buy_quantity,
      get_quantity: promotion.get_quantity,
      get_discount_percentage: promotion.get_discount_percentage,
      minimum_quantity: promotion.minimum_quantity,
      minimum_amount: promotion.minimum_amount,
      priority: promotion.priority,
      is_active: promotion.is_active,
      is_stackable: promotion.is_stackable
    });

    // If promotion has been used, disable certain fields
    if (this.hasUsage()) {
      this.promotionForm.get('discount_type')?.disable();
      this.promotionForm.get('apply_to')?.disable();
    }
  }

  protected hasUsage(): boolean {
    return (this.promotion()?.usage_count || 0) > 0;
  }

  protected hasSelections(): boolean {
    const promotion = this.promotion();
    if (!promotion) return false;

    switch (promotion.apply_to) {
      case 'products':
        return (promotion.products_details?.length || 0) > 0;
      case 'categories':
        return (promotion.categories_details?.length || 0) > 0;
      case 'brands':
        return (promotion.brands_details?.length || 0) > 0;
      default:
        return false;
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
    if (this.promotionForm.valid && this.promotion()) {
      this.isSubmitting.set(true);

      // Get form data and include disabled fields
      const formData = {
        ...this.promotionForm.value,
        ...this.promotionForm.getRawValue() // Include disabled fields
      } as PromotionCreateRequest;

      this.promotionsService.updatePromotion(this.promotion()!.id, formData).subscribe({
        next: (promotion) => {
          this.toastService.success('Promotion updated successfully');
          this.router.navigate(['/promotions/promotions', promotion.id]);
        },
        error: (error) => {
          console.error('Error updating promotion:', error);
          this.toastService.error(error.error?.message || 'Failed to update promotion');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  protected onCancel(): void {
    const promotion = this.promotion();
    if (promotion) {
      this.router.navigate(['/promotions/promotions', promotion.id]);
    } else {
      this.router.navigate(['/promotions/promotions']);
    }
  }
}
