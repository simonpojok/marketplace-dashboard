import {Component, input, output, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ProductVariation, VARIATION_ATTRIBUTES} from '../../models/product-variation.model';

@Component({
  selector: 'app-variation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ isEdit() ? 'Edit Variation' : 'Add New Variation' }}
        </h4>
        <button
          *ngIf="isEdit()"
          type="button"
          (click)="cancelEdit()"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </button>
      </div>

      <!-- Attributes Section -->
      <div class="space-y-3">
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Attributes
        </div>

        <div *ngIf="availableAttributes().length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
          No attributes selected. Please select attributes first.
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div *ngFor="let attrKey of availableAttributes()" class="space-y-1">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
              {{ getAttributeLabel(attrKey) }}
            </label>

            <!-- Text Input -->
            <input
              *ngIf="getAttributeType(attrKey) === 'text'"
              type="text"
              [value]="formData().attributes?.[attrKey] || ''"
              (input)="updateAttribute(attrKey, $event)"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              [placeholder]="'Enter ' + getAttributeLabel(attrKey).toLowerCase()"
            >

            <!-- Select Input -->
            <select
              *ngIf="getAttributeType(attrKey) === 'select'"
              [value]="formData().attributes?.[attrKey] || ''"
              (change)="updateAttribute(attrKey, $event)"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select {{ getAttributeLabel(attrKey) }}</option>
              <option *ngFor="let option of getAttributeOptions(attrKey)" [value]="option">
                {{ option }}
              </option>
            </select>

            <!-- Color + Text Input -->
            <div *ngIf="getAttributeType(attrKey) === 'color-text'" class="flex space-x-2">
              <input
                type="color"
                [value]="getColorValue(formData().attributes?.[attrKey] || '')"
                (input)="updateColorAttribute(attrKey, $event)"
                class="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              >
              <input
                type="text"
                [value]="formData().attributes?.[attrKey] || ''"
                (input)="updateAttribute(attrKey, $event)"
                class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                placeholder="Color name"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing & Stock Section -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <!-- SKU -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            SKU
          </label>
          <input
            type="text"
            [value]="formData().sku || ''"
            (input)="updateField('sku', $event)"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            placeholder="Auto-generated"
          >
        </div>

        <!-- Price Adjustment -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Price Adjustment
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-xs text-gray-500 dark:text-gray-400">UGX</span>
            <input
              type="number"
              step="0.01"
              [value]="formData().price_adjustment || 0"
              (input)="updateField('price_adjustment', $event)"
              class="w-full pl-12 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
            >
          </div>
        </div>

        <!-- Stock Quantity -->
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            [value]="formData().stock_quantity || 0"
            (input)="updateField('stock_quantity', $event)"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            placeholder="0"
            required
          >
        </div>
      </div>

      <!-- Image URL -->
      <div class="space-y-1">
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Variation Image URL (Optional)
        </label>
        <input
          type="url"
          [value]="formData().image_url || ''"
          (input)="updateField('image_url', $event)"
          class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          placeholder="https://example.com/variation-image.jpg"
        >
      </div>

      <!-- Active Status -->
      <div class="flex items-center space-x-2">
        <input
          type="checkbox"
          id="variation-active"
          [checked]="formData().is_active !== false"
          (change)="updateField('is_active', $event)"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
        >
        <label for="variation-active" class="text-sm text-gray-700 dark:text-gray-300">
          Active
        </label>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          (click)="resetForm()"
          class="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Reset
        </button>
        <button
          type="button"
          (click)="saveVariation()"
          [disabled]="!isFormValid()"
          class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
        >
          {{ isEdit() ? 'Update' : 'Add' }} Variation
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class VariationFormComponent {
  // Inputs
  availableAttributes = input<string[]>([]);
  editingVariation = input<ProductVariation | null>(null);
  basePrice = input<number>(0);

  // Outputs
  variationSaved = output<ProductVariation>();
  editCancelled = output<void>();

  // State
  protected formData = signal<Partial<ProductVariation>>({
    sku: '',
    attributes: {},
    price_adjustment: 0,
    stock_quantity: 0,
    image_url: '',
    is_active: true
  });

  // Computed
  protected isEdit = computed(() => !!this.editingVariation());

  constructor() {
    // Watch for editing variation changes
    this.watchEditingVariation();
  }

  private watchEditingVariation(): void {
    // In a real app, you'd use effect() from @angular/core
    // For now, we'll handle this in ngOnChanges equivalent
  }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    const editing = this.editingVariation();
    if (editing) {
      this.formData.set({...editing});
    } else {
      this.resetForm();
    }
  }

  protected updateAttribute(attributeKey: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.formData.update(data => ({
      ...data,
      attributes: {
        ...data.attributes,
        [attributeKey]: value
      }
    }));
  }

  protected updateColorAttribute(attributeKey: string, event: Event): void {
    const colorValue = (event.target as HTMLInputElement).value;
    const currentValue = this.formData().attributes?.[attributeKey] || '';

    // If there's already text, preserve it, otherwise use color name
    const colorName = this.getColorName(colorValue);
    this.formData.update(data => ({
      ...data,
      attributes: {
        ...data.attributes,
        [attributeKey]: currentValue || colorName
      }
    }));
  }

  protected updateField(field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    let value: any = target.value;

    // Convert to appropriate type
    if (field === 'price_adjustment' || field === 'stock_quantity') {
      value = parseFloat(value) || 0;
    } else if (field === 'is_active') {
      value = target.checked;
    }

    this.formData.update(data => ({
      ...data,
      [field]: value
    }));
  }

  protected saveVariation(): void {
    if (!this.isFormValid()) return;

    const data = this.formData();

    // Generate SKU if not provided
    if (!data.sku?.trim()) {
      data.sku = this.generateSKU();
    }

    const variation: ProductVariation = {
      id: this.editingVariation()?.id,
      sku: data.sku || '',
      attributes: data.attributes || {},
      price_adjustment: data.price_adjustment || 0,
      stock_quantity: data.stock_quantity || 0,
      image_url: data.image_url || '',
      is_active: data.is_active !== false
    };

    this.variationSaved.emit(variation);

    if (!this.isEdit()) {
      this.resetForm();
    }
  }

  protected resetForm(): void {
    const defaultAttributes: { [key: string]: string } = {};

    // Initialize attributes with empty values
    this.availableAttributes().forEach(attr => {
      defaultAttributes[attr] = '';
    });

    this.formData.set({
      sku: '',
      attributes: defaultAttributes,
      price_adjustment: 0,
      stock_quantity: 0,
      image_url: '',
      is_active: true
    });
  }

  protected cancelEdit(): void {
    this.editCancelled.emit();
    this.resetForm();
  }

  protected isFormValid(): boolean {
    const data = this.formData();

    // Check if at least one attribute has a value
    const hasAttributes = Object.values(data.attributes || {}).some(value => value.trim() !== '');

    // Check required fields
    const hasRequiredFields = (data.stock_quantity || 0) >= 0;

    return hasAttributes && hasRequiredFields;
  }

  private generateSKU(): string {
    const attributes = this.formData().attributes || {};
    const attrValues = Object.values(attributes)
      .filter(value => value.trim() !== '')
      .map(value => value.substring(0, 2).toUpperCase())
      .join('-');

    const timestamp = Date.now().toString().slice(-4);
    return `VAR-${attrValues || 'DEFAULT'}-${timestamp}`;
  }

  protected getColorValue(colorName: string): string {
    // Simple color name to hex mapping
    const colorMap: { [key: string]: string } = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#008000',
      'black': '#000000',
      'white': '#ffffff',
      'yellow': '#ffff00',
      'pink': '#ffc0cb',
      'purple': '#800080',
      'orange': '#ffa500',
      'gray': '#808080'
    };

    return colorMap[colorName.toLowerCase()] || '#000000';
  }

  private getColorName(hexColor: string): string {
    // Simple hex to color name mapping
    const colorMap: { [key: string]: string } = {
      '#ff0000': 'Red',
      '#0000ff': 'Blue',
      '#008000': 'Green',
      '#000000': 'Black',
      '#ffffff': 'White',
      '#ffff00': 'Yellow',
      '#ffc0cb': 'Pink',
      '#800080': 'Purple',
      '#ffa500': 'Orange',
      '#808080': 'Gray'
    };

    return colorMap[hexColor.toLowerCase()] || 'Custom';
  }

  // Helper methods
  protected getAttributeLabel(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.label || key;
  }

  protected getAttributeType(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.type || 'text';
  }

  protected getAttributeOptions(key: string): string[] {
    return VARIATION_ATTRIBUTES[key]?.options || [];
  }
}
