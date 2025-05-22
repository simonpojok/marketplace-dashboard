import {Component, Input, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-product-variations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'product-variations.component.html',
  styles: []
})
export class ProductVariationsComponent {
  @Input() variationsFormArray!: FormArray;

  private fb = new FormBuilder();

  constructor(private cdr: ChangeDetectorRef) {}

  get variationGroups(): FormGroup[] {
    return this.variationsFormArray.controls as FormGroup[];
  }

  protected addVariation(): void {
    const variationGroup = this.fb.group({
      id: [null],
      sku: [''], // Auto-generated on backend
      size: [''],
      color: [''],
      color_code: ['#000000'],
      memory: [''],
      storage: [''],
      custom_attribute: [''],
      price_adjustment: [0],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      is_active: [true]
    });

    this.variationsFormArray.push(variationGroup);
    this.cdr.detectChanges();
  }

  protected removeVariation(index: number): void {
    this.variationsFormArray.removeAt(index);
    this.cdr.detectChanges();
  }

  protected toggleActive(variationGroup: FormGroup): void {
    const currentValue = variationGroup.get('is_active')?.value;
    variationGroup.patchValue({ is_active: !currentValue });
    this.cdr.detectChanges();
  }

  protected onAttributeChange(variationGroup: FormGroup, controlName: string, event: any): void {
    const value = event.target.value;
    variationGroup.get(controlName)?.setValue(value);
    variationGroup.get(controlName)?.markAsTouched();
    this.cdr.detectChanges();
  }

  protected getSizeChoices(): { value: string, label: string }[] {
    return [
      { value: 'XS', label: 'Extra Small (XS)' },
      { value: 'S', label: 'Small (S)' },
      { value: 'M', label: 'Medium (M)' },
      { value: 'L', label: 'Large (L)' },
      { value: 'XL', label: 'Extra Large (XL)' },
      { value: 'XXL', label: 'Double XL (XXL)' },
      { value: '3XL', label: 'Triple XL (3XL)' },
      { value: 'CUSTOM', label: 'Custom Size' }
    ];
  }

  protected getMemoryChoices(): { value: string, label: string }[] {
    return [
      { value: '2GB', label: '2 GB RAM' },
      { value: '3GB', label: '3 GB RAM' },
      { value: '4GB', label: '4 GB RAM' },
      { value: '6GB', label: '6 GB RAM' },
      { value: '8GB', label: '8 GB RAM' },
      { value: '12GB', label: '12 GB RAM' },
      { value: '16GB', label: '16 GB RAM' },
      { value: '32GB', label: '32 GB RAM' },
      { value: '64GB', label: '64 GB RAM' }
    ];
  }

  protected getStorageChoices(): { value: string, label: string }[] {
    return [
      { value: '16GB', label: '16 GB Storage' },
      { value: '32GB', label: '32 GB Storage' },
      { value: '64GB', label: '64 GB Storage' },
      { value: '128GB', label: '128 GB Storage' },
      { value: '256GB', label: '256 GB Storage' },
      { value: '512GB', label: '512 GB Storage' },
      { value: '1TB', label: '1 TB Storage' },
      { value: '2TB', label: '2 TB Storage' }
    ];
  }

  protected hasVariationData(variationGroup: FormGroup): boolean {
    const size = variationGroup.get('size')?.value;
    const color = variationGroup.get('color')?.value;
    const memory = variationGroup.get('memory')?.value;
    const storage = variationGroup.get('storage')?.value;

    return !!(size || color || memory || storage);
  }

  protected getDisplaySize(variationGroup: FormGroup): string {
    const size = variationGroup.get('size')?.value;
    if (size === 'CUSTOM') {
      return variationGroup.get('custom_attribute')?.value || 'Custom';
    }
    return this.getSizeChoices().find(s => s.value === size)?.label || size;
  }

  protected getVariationSummary(variationGroup: FormGroup): string {
    const attributes = [];

    const size = variationGroup.get('size')?.value;
    if (size) {
      if (size === 'CUSTOM') {
        const customAttr = variationGroup.get('custom_attribute')?.value;
        attributes.push(customAttr || 'Custom Size');
      } else {
        // Get display label for size
        const sizeLabel = this.getSizeChoices().find(s => s.value === size)?.label;
        attributes.push(sizeLabel || size);
      }
    }

    const color = variationGroup.get('color')?.value;
    if (color) {
      attributes.push(color);
    }

    const memory = variationGroup.get('memory')?.value;
    if (memory) {
      attributes.push(memory);
    }

    const storage = variationGroup.get('storage')?.value;
    if (storage) {
      attributes.push(storage);
    }

    return attributes.length > 0 ? attributes.join(' • ') : 'No attributes set';
  }

  protected getStockStatusClass(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300';
    } else if (stockQuantity > 0 && stockQuantity <= 10) {
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300';
    } else {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300';
    }
  }

  protected getStockDotClass(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'bg-red-500';
    } else if (stockQuantity > 0 && stockQuantity <= 10) {
      return 'bg-amber-500';
    } else {
      return 'bg-green-500';
    }
  }

  protected getStockStatusText(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'Out of Stock';
    } else if (stockQuantity > 0 && stockQuantity <= 10) {
      return `Low Stock`;
    } else {
      return `In Stock`;
    }
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
