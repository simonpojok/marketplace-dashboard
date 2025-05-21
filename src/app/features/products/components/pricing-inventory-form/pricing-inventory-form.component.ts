import {Component, input, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-pricing-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pricing-inventory-form.component.html',
  styles: []
})
export class PricingInventoryFormComponent {
  parentForm = input.required<FormGroup>()

  discountPercentage(): number {
    const price = this.parentForm().get('price')?.value || 0;
    const discountPrice = this.parentForm().get('discount_price')?.value;

    if (price > 0 && discountPrice != null && discountPrice > 0 && discountPrice < price) {
      return Math.round(((price - discountPrice) / price) * 100);
    }
    return 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
