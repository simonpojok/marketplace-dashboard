import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-product-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'product-pricing.component.html',
  styles: []
})
export class ProductPricingComponent {
  @Input() formGroup!: FormGroup;
  @Input() discountPercentage = 0;
  @Input() hasVariations = false;
}
