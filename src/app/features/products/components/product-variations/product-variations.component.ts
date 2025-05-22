import {Component, Input} from '@angular/core';
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

  get variationGroups(): FormGroup[] {
    return this.variationsFormArray.controls as FormGroup[];
  }

  protected addVariation(): void {
    const variationGroup = this.fb.group({
      id: [null],
      sku: [''], // Auto-generated
      size: [''],
      color: [''],
      color_code: [''],
      memory: [''],
      storage: [''],
      custom_attribute: [''],
      price_adjustment: [0],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      is_active: [true]
    });

    this.variationsFormArray.push(variationGroup);
  }

  protected removeVariation(index: number): void {
    this.variationsFormArray.removeAt(index);
  }

  protected getSizeChoices(): { value: string, label: string }[] {
    return [
      { value: 'XS', label: 'Extra Small' },
      { value: 'S', label: 'Small' },
      { value: 'M', label: 'Medium' },
      { value: 'L', label: 'Large' },
      { value: 'XL', label: 'Extra Large' },
      { value: 'XXL', label: 'Double Extra Large' },
      { value: '3XL', label: 'Triple Extra Large' },
      { value: 'CUSTOM', label: 'Custom Size' }
    ];
  }

  protected getMemoryChoices(): { value: string, label: string }[] {
    return [
      { value: '2GB', label: '2 GB' },
      { value: '3GB', label: '3 GB' },
      { value: '4GB', label: '4 GB' },
      { value: '6GB', label: '6 GB' },
      { value: '8GB', label: '8 GB' },
      { value: '12GB', label: '12 GB' },
      { value: '16GB', label: '16 GB' },
      { value: '32GB', label: '32 GB' },
      { value: '64GB', label: '64 GB' }
    ];
  }

  protected getStorageChoices(): { value: string, label: string }[] {
    return [
      { value: '16GB', label: '16 GB' },
      { value: '32GB', label: '32 GB' },
      { value: '64GB', label: '64 GB' },
      { value: '128GB', label: '128 GB' },
      { value: '256GB', label: '256 GB' },
      { value: '512GB', label: '512 GB' },
      { value: '1TB', label: '1 TB' },
      { value: '2TB', label: '2 TB' }
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
      attributes.push(this.getDisplaySize(variationGroup));
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
}
