import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-variations-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-variations-form.component.html',
  styles: []
})
export class ProductVariationsFormComponent {
  @Input() parentForm!: FormGroup;
  @Input() hasVariations = false;
  @Input() uploadedImages: { file: File, preview: string }[] = [];

  @Output() variationAdded = new EventEmitter<void>();
  @Output() variationRemoved = new EventEmitter<number>();
  @Output() variationImageUploaded = new EventEmitter<{event: Event, index: number}>();

  get variationsFormArray(): FormArray {
    return this.parentForm.get('variations') as FormArray;
  }

  onVariationAdded(): void {
    this.variationAdded.emit();
  }

  onVariationRemoved(index: number): void {
    this.variationRemoved.emit(index);
  }

  onVariationImageUploaded(event: Event, index: number): void {
    this.variationImageUploaded.emit({ event, index });
  }

  triggerFileInput(inputId: string): void {
    const element = document.getElementById(inputId) as HTMLInputElement;
    if (element) {
      element.click();
    }
  }

  removeVariationImage(variationGroup: FormGroup): void {
    variationGroup.get('image')?.setValue('');
  }

  // Helper method to get FormGroup at index - REQUIRED by template
  getVariationGroup(index: number): FormGroup {
    return this.variationsFormArray.at(index) as FormGroup;
  }

  // Helper method to check if a variation has a specific type - REQUIRED by template
  hasVariationType(variationGroup: FormGroup, type: string): boolean {
    return variationGroup.get('type')?.value === type;
  }

  // Helper method to check if variation needs custom field - REQUIRED by template
  needsCustomField(variationGroup: FormGroup): boolean {
    const type = variationGroup.get('type')?.value;
    if (type === 'custom') return true;

    // Check if any of the type-specific fields has 'CUSTOM' value
    const fieldValue = variationGroup.get(this.getFieldNameForType(type))?.value;
    return fieldValue === 'CUSTOM';
  }

  // Private helper to map variation type to form field name
  private getFieldNameForType(type: string): string {
    switch (type) {
      case 'size': return 'size';
      case 'screen': return 'screen_size';
      case 'memory': return 'memory';
      case 'storage': return 'storage';
      case 'processor': return 'processor';
      case 'color': return 'color';
      default: return '';
    }
  }

  // Choice methods for dropdowns - REQUIRED by template
  getSizeChoices(): { value: string, label: string }[] {
    return [
      {value: 'XS', label: 'Extra Small'},
      {value: 'S', label: 'Small'},
      {value: 'M', label: 'Medium'},
      {value: 'L', label: 'Large'},
      {value: 'XL', label: 'Extra Large'},
      {value: 'XXL', label: 'Double Extra Large'},
      {value: 'CUSTOM', label: 'Custom Size'}
    ];
  }

  getScreenSizeChoices(): { value: string, label: string }[] {
    return [
      {value: '4.7', label: '4.7 inch'},
      {value: '5.4', label: '5.4 inch'},
      {value: '5.5', label: '5.5 inch'},
      {value: '6.1', label: '6.1 inch'},
      {value: '6.5', label: '6.5 inch'},
      {value: '6.7', label: '6.7 inch'},
      {value: '6.9', label: '6.9 inch'},
      {value: '7.0', label: '7.0 inch'},
      {value: 'CUSTOM', label: 'Custom Size'}
    ];
  }

  getMemoryChoices(): { value: string, label: string }[] {
    return [
      {value: '2GB', label: '2 GB'},
      {value: '3GB', label: '3 GB'},
      {value: '4GB', label: '4 GB'},
      {value: '6GB', label: '6 GB'},
      {value: '8GB', label: '8 GB'},
      {value: '12GB', label: '12 GB'},
      {value: '16GB', label: '16 GB'},
      {value: '18GB', label: '18 GB'},
      {value: '20GB', label: '20 GB'},
      {value: '24GB', label: '24 GB'},
      {value: '32GB', label: '32 GB'},
      {value: 'CUSTOM', label: 'Custom Size'}
    ];
  }

  getStorageChoices(): { value: string, label: string }[] {
    return [
      {value: '16GB', label: '16 GB'},
      {value: '32GB', label: '32 GB'},
      {value: '64GB', label: '64 GB'},
      {value: '128GB', label: '128 GB'},
      {value: '256GB', label: '256 GB'},
      {value: '512GB', label: '512 GB'},
      {value: '1TB', label: '1 TB'},
      {value: '2TB', label: '2 TB'},
      {value: '4TB', label: '4 TB'},
      {value: '8TB', label: '8 TB'},
      {value: 'CUSTOM', label: 'Custom Size'}
    ];
  }

  getProcessorChoices(): { value: string, label: string }[] {
    return [
      // Qualcomm Snapdragon
      {value: 'Snapdragon 8 Gen 3', label: 'Snapdragon 8 Gen 3'},
      {value: 'Snapdragon 8 Gen 2', label: 'Snapdragon 8 Gen 2'},
      {value: 'Snapdragon 8 Gen 1', label: 'Snapdragon 8 Gen 1'},
      {value: 'Snapdragon 7 Gen 3', label: 'Snapdragon 7 Gen 3'},
      {value: 'Snapdragon 7 Gen 1', label: 'Snapdragon 7 Gen 1'},
      {value: 'Snapdragon 6 Gen 1', label: 'Snapdragon 6 Gen 1'},

      // MediaTek Dimensity
      {value: 'MediaTek Dimensity 9300', label: 'MediaTek Dimensity 9300'},
      {value: 'MediaTek Dimensity 9200', label: 'MediaTek Dimensity 9200'},
      {value: 'MediaTek Dimensity 8300', label: 'MediaTek Dimensity 8300'},
      {value: 'MediaTek Dimensity 8200', label: 'MediaTek Dimensity 8200'},
      {value: 'MediaTek Dimensity 7300', label: 'MediaTek Dimensity 7300'},
      {value: 'MediaTek Dimensity 6300', label: 'MediaTek Dimensity 6300'},

      // Apple Silicon
      {value: 'Apple A17 Pro', label: 'Apple A17 Pro'},
      {value: 'Apple A17', label: 'Apple A17'},
      {value: 'Apple A16 Bionic', label: 'Apple A16 Bionic'},
      {value: 'Apple A15 Bionic', label: 'Apple A15 Bionic'},
      {value: 'Apple A14 Bionic', label: 'Apple A14 Bionic'},

      // Google Tensor
      {value: 'Google Tensor G4', label: 'Google Tensor G4'},
      {value: 'Google Tensor G3', label: 'Google Tensor G3'},
      {value: 'Google Tensor G2', label: 'Google Tensor G2'},

      // Samsung Exynos
      {value: 'Samsung Exynos 2400', label: 'Samsung Exynos 2400'},
      {value: 'Samsung Exynos 2200', label: 'Samsung Exynos 2200'},
      {value: 'Samsung Exynos 1480', label: 'Samsung Exynos 1480'},

      // HiSilicon Kirin (older but still relevant)
      {value: 'HiSilicon Kirin 9000', label: 'HiSilicon Kirin 9000'},
      {value: 'HiSilicon Kirin 990', label: 'HiSilicon Kirin 990'},

      // Custom option
      {value: 'CUSTOM', label: 'Custom Processor'}
    ];
  }

  // Utility method for currency formatting (if needed in template)
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper method to get variation summary for display
  getVariationSummary(variationGroup: FormGroup): string {
    const type = variationGroup.get('type')?.value;
    const parts: string[] = [];

    switch (type) {
      case 'size':
        const size = variationGroup.get('size')?.value;
        if (size) {
          if (size === 'CUSTOM') {
            const custom = variationGroup.get('custom_attribute')?.value;
            parts.push(`Size: ${custom || 'Custom'}`);
          } else {
            parts.push(`Size: ${size}`);
          }
        }
        break;

      case 'color':
        const color = variationGroup.get('color')?.value;
        if (color) parts.push(`Color: ${color}`);
        break;

      case 'screen':
        const screen = variationGroup.get('screen_size')?.value;
        if (screen) {
          if (screen === 'CUSTOM') {
            const custom = variationGroup.get('custom_attribute')?.value;
            parts.push(`Screen: ${custom || 'Custom'}`);
          } else {
            parts.push(`Screen: ${screen}"`);
          }
        }
        break;

      case 'memory':
        const memory = variationGroup.get('memory')?.value;
        if (memory) {
          if (memory === 'CUSTOM') {
            const custom = variationGroup.get('custom_attribute')?.value;
            parts.push(`RAM: ${custom || 'Custom'}`);
          } else {
            parts.push(`RAM: ${memory}`);
          }
        }
        break;

      case 'storage':
        const storage = variationGroup.get('storage')?.value;
        if (storage) {
          if (storage === 'CUSTOM') {
            const custom = variationGroup.get('custom_attribute')?.value;
            parts.push(`Storage: ${custom || 'Custom'}`);
          } else {
            parts.push(`Storage: ${storage}`);
          }
        }
        break;

      case 'processor':
        const processor = variationGroup.get('processor')?.value;
        if (processor) {
          if (processor === 'CUSTOM') {
            const custom = variationGroup.get('custom_attribute')?.value;
            parts.push(`CPU: ${custom || 'Custom'}`);
          } else {
            parts.push(`CPU: ${processor}`);
          }
        }
        break;

      case 'custom':
        const custom = variationGroup.get('custom_attribute')?.value;
        if (custom) parts.push(custom);
        break;
    }

    return parts.length > 0 ? parts.join(', ') : 'No attributes set';
  }

  // Helper method to check if variation has required fields filled
  isVariationValid(variationGroup: FormGroup): boolean {
    const stockQuantity = variationGroup.get('stock_quantity')?.value;
    const type = variationGroup.get('type')?.value;

    // Stock quantity is always required
    if (!stockQuantity || stockQuantity < 0) return false;

    // Check type-specific validations
    switch (type) {
      case 'size':
        return !!variationGroup.get('size')?.value;
      case 'color':
        return !!variationGroup.get('color')?.value;
      case 'screen':
        return !!variationGroup.get('screen_size')?.value;
      case 'memory':
        return !!variationGroup.get('memory')?.value;
      case 'storage':
        return !!variationGroup.get('storage')?.value;
      case 'processor':
        return !!variationGroup.get('processor')?.value;
      case 'custom':
        return !!variationGroup.get('custom_attribute')?.value;
      default:
        return false;
    }
  }

  // Helper method to get validation errors for a variation
  getVariationErrors(variationGroup: FormGroup): string[] {
    const errors: string[] = [];
    const type = variationGroup.get('type')?.value;

    if (!variationGroup.get('stock_quantity')?.value && variationGroup.get('stock_quantity')?.value !== 0) {
      errors.push('Stock quantity is required');
    }

    if (variationGroup.get('stock_quantity')?.value < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    switch (type) {
      case 'size':
        if (!variationGroup.get('size')?.value) {
          errors.push('Size selection is required');
        }
        break;
      case 'color':
        if (!variationGroup.get('color')?.value) {
          errors.push('Color name is required');
        }
        break;
      case 'screen':
        if (!variationGroup.get('screen_size')?.value) {
          errors.push('Screen size selection is required');
        }
        break;
      case 'memory':
        if (!variationGroup.get('memory')?.value) {
          errors.push('Memory selection is required');
        }
        break;
      case 'storage':
        if (!variationGroup.get('storage')?.value) {
          errors.push('Storage selection is required');
        }
        break;
      case 'processor':
        if (!variationGroup.get('processor')?.value) {
          errors.push('Processor selection is required');
        }
        break;
      case 'custom':
        if (!variationGroup.get('custom_attribute')?.value) {
          errors.push('Custom attribute value is required');
        }
        break;
    }

    // Check if CUSTOM fields need custom_attribute
    const needsCustom = this.needsCustomField(variationGroup);
    if (needsCustom && !variationGroup.get('custom_attribute')?.value) {
      errors.push('Custom value is required when "Custom" is selected');
    }

    return errors;
  }
}
