import {Component, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductVariation, VARIATION_ATTRIBUTES} from '../../models/product-variation.model';

@Component({
  selector: 'app-variation-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          Product Variations ({{ variations().length }})
        </h4>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Click on a variation to edit
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="variations().length === 0"
           class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No variations</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add variations to offer different options for this product.
        </p>
      </div>

      <!-- Variations Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let variation of variations(); let i = index"
          class="variation-tile cursor-pointer"
          [class.selected]="selectedIndex() === i"
          (click)="selectVariation(i)"
        >
          <!-- Variation Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ getVariationDisplayName(variation) }}
              </h5>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                SKU: {{ variation.sku || 'Auto-generated' }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-1 ml-2">
              <button
                type="button"
                (click)="editVariation(i, $event)"
                class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
              <button
                type="button"
                (click)="deleteVariation(i, $event)"
                class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Attributes -->
          <div class="space-y-2 mb-3">
            <div class="flex flex-wrap gap-1">
              <span
                *ngFor="let attr of getAttributeList(variation.attributes)"
                class="attribute-chip"
              >
                {{ attr.label }}: {{ attr.value }}
              </span>
            </div>
          </div>

          <!-- Pricing Info -->
          <div class="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div class="text-xs">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ formatCurrency(calculateFinalPrice(variation)) }}
              </div>
              <div *ngIf="variation.price_adjustment !== 0" class="text-gray-500 dark:text-gray-400">
                {{ variation.price_adjustment > 0 ? '+' : '' }}{{ formatCurrency(variation.price_adjustment) }}
              </div>
            </div>
            <div class="text-right text-xs">
              <div
                class="stock-indicator"
                [ngClass]="getStockStatusClass(variation.stock_quantity)"
              >
                {{ getStockStatusText(variation.stock_quantity) }}
              </div>
            </div>
          </div>

          <!-- Status & Image -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span
                class="w-2 h-2 rounded-full"
                [class.bg-green-500]="variation.is_active"
                [class.bg-gray-400]="!variation.is_active"
              ></span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ variation.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div *ngIf="variation.image_url" class="w-8 h-8 rounded overflow-hidden">
              <img
                [src]="variation.image_url"
                [alt]="getVariationDisplayName(variation)"
                class="w-full h-full object-cover"
                (error)="onImageError($event)"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div *ngIf="variations().length > 0"
           class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <button
            type="button"
            (click)="toggleAllActive()"
            class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
          >
            {{ allActive() ? 'Deactivate All' : 'Activate All' }}
          </button>
          <span class="text-gray-300 dark:text-gray-600">|</span>
          <button
            type="button"
            (click)="clearAll()"
            class="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-500"
          >
            Clear All
          </button>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Total Stock: {{ getTotalStock() }} items
        </div>
      </div>
    </div>
  `,
  styles: [`
    .variation-tile {
      @apply border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200;
    }

    .variation-tile.selected {
      @apply border-primary-500 bg-primary-50 dark:bg-primary-900/20;
    }

    .attribute-chip {
      @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200;
    }

    .stock-indicator {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }

    .stock-indicator.in-stock {
      @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300;
    }

    .stock-indicator.low-stock {
      @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300;
    }

    .stock-indicator.out-of-stock {
      @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300;
    }
  `]
})
export class VariationListComponent {
  // Inputs
  variations = input<ProductVariation[]>([]);
  basePrice = input<number>(0);
  selectedIndex = input<number | null>(null);

  // Outputs
  variationSelected = output<number>();
  variationEdit = output<number>();
  variationDelete = output<number>();
  bulkToggleActive = output<boolean>();
  clearAllVariations = output<void>();

  protected selectVariation(index: number): void {
    this.variationSelected.emit(index);
  }

  protected editVariation(index: number, event: Event): void {
    event.stopPropagation();
    this.variationEdit.emit(index);
  }

  protected deleteVariation(index: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this variation?')) {
      this.variationDelete.emit(index);
    }
  }

  protected toggleAllActive(): void {
    this.bulkToggleActive.emit(!this.allActive());
  }

  protected clearAll(): void {
    if (confirm('Are you sure you want to remove all variations?')) {
      this.clearAllVariations.emit();
    }
  }

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  // Helper methods
  protected getVariationDisplayName(variation: ProductVariation): string {
    const attributeStrings = Object.entries(variation.attributes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => `${this.getAttributeLabel(key)}: ${this.formatAttributeValue(value)}`);

    return attributeStrings.length > 0 ? attributeStrings.join(', ') : 'No attributes';
  }

  protected getAttributeList(attributes: { [key: string]: string }): Array<{ label: string, value: string }> {
    return Object.entries(attributes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => ({
        label: this.getAttributeLabel(key),
        value: this.formatAttributeValue(value)
      }));
  }

  protected formatAttributeValue(value: string): string {
    // If it's a custom value, show it more cleanly
    if (value.startsWith('Custom:')) {
      const customValue = value.replace('Custom:', '').trim();
      return customValue || 'Custom';
    }
    return value;
  }

  protected getAttributeLabel(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.label || key;
  }

  protected calculateFinalPrice(variation: ProductVariation): number {
    return this.basePrice() + (variation.price_adjustment || 0);
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected getStockStatusClass(stockQuantity: number): string {
    if (stockQuantity === 0) return 'out-of-stock';
    if (stockQuantity < 10) return 'low-stock';
    return 'in-stock';
  }

  protected getStockStatusText(stockQuantity: number): string {
    if (stockQuantity === 0) return 'Out of Stock';
    if (stockQuantity < 10) return `Low (${stockQuantity})`;
    return `${stockQuantity}`;
  }

  protected allActive(): boolean {
    return this.variations().length > 0 && this.variations().every(v => v.is_active);
  }

  protected getTotalStock(): number {
    return this.variations().reduce((total, variation) => total + (variation.stock_quantity || 0), 0);
  }
}
