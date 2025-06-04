import {Component, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProductVariation} from '../../models/product-variation.model';
import {
  VariationAttributeSelectorComponent
} from '../variation-attribute-selector/variation-attribute-selector.component';
import {VariationFormComponent} from '../variation-form/variation-form.component';
import {VariationListComponent} from '../variation-list/variation-list.component';

@Component({
  selector: 'app-variation-manager',
  standalone: true,
  imports: [
    CommonModule,
    VariationAttributeSelectorComponent,
    VariationFormComponent,
    VariationListComponent
  ],
  template: `
    <div
      class="bg-white dark:bg-dark-bg-secondary shadow-sm rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Product Variations</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ variations().length }} variation{{ variations().length !== 1 ? 's' : '' }}
            </span>
            <button
              type="button"
              (click)="toggleExpanded()"
              class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 transition-transform duration-200"
                [class.rotate-180]="!isExpanded()"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="isExpanded()" class="p-6 space-y-6">
        <!-- Step 1: Attribute Selection -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div
              class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              1
            </div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              Select Product Attributes
            </h3>
          </div>

          <app-variation-attribute-selector
            [selectedAttributes]="availableAttributes()"
            (attributeSelected)="onAttributeSelected($event)"
            (attributeRemoved)="onAttributeRemoved($event)"
          />
        </div>

        <!-- Step 2: Add Variations (only show if attributes are selected) -->
        <div *ngIf="availableAttributes().length > 0" class="space-y-4">
          <div class="flex items-center space-x-2">
            <div
              class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              2
            </div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              Add Variations
            </h3>
          </div>

          <app-variation-form
            [availableAttributes]="availableAttributes()"
            [editingVariation]="editingVariation()"
            [basePrice]="basePrice()"
            (variationSaved)="onVariationSaved($event)"
            (editCancelled)="onEditCancelled()"
          />
        </div>

        <!-- Step 3: Manage Variations (only show if variations exist) -->
        <div *ngIf="variations().length > 0" class="space-y-4">
          <div class="flex items-center space-x-2">
            <div
              class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              3
            </div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              Manage Variations
            </h3>
          </div>

          <app-variation-list
            [variations]="variations()"
            [basePrice]="basePrice()"
            [selectedIndex]="selectedVariationIndex()"
            (variationSelected)="onVariationSelected($event)"
            (variationEdit)="onVariationEdit($event)"
            (variationDelete)="onVariationDelete($event)"
            (bulkToggleActive)="onBulkToggleActive($event)"
            (clearAllVariations)="onClearAllVariations()"
          />
        </div>

        <!-- Summary -->
        <div *ngIf="variations().length > 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ variations().length }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Total Variations
              </div>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ getActiveCount() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Active
              </div>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ getTotalStock() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Total Stock
              </div>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(getAveragePrice()) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Avg. Price
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VariationManagerComponent {
  // Inputs
  variations = input<ProductVariation[]>([]);
  basePrice = input<number>(0);

  // Outputs
  variationsChanged = output<ProductVariation[]>();

  // Local state
  protected isExpanded = signal(true);
  protected availableAttributes = signal<string[]>([]);
  protected selectedVariationIndex = signal<number | null>(null);
  protected editingVariation = signal<ProductVariation | null>(null);

  // Attribute management
  protected onAttributeSelected(attributeKey: string): void {
    this.availableAttributes.update(attrs => {
      if (!attrs.includes(attributeKey)) {
        return [...attrs, attributeKey];
      }
      return attrs;
    });
  }

  protected onAttributeRemoved(attributeKey: string): void {
    this.availableAttributes.update(attrs =>
      attrs.filter(attr => attr !== attributeKey)
    );

    // Remove attribute from all existing variations
    const updatedVariations = this.variations().map(variation => {
      const newAttributes = {...variation.attributes};
      delete newAttributes[attributeKey];
      return {...variation, attributes: newAttributes};
    });

    this.variationsChanged.emit(updatedVariations);
  }

  // Variation management
  protected onVariationSaved(variation: ProductVariation): void {
    if (variation.id) {
      // Update existing variation
      const updatedVariations = this.variations().map(v =>
        v.id === variation.id ? variation : v
      );
      this.variationsChanged.emit(updatedVariations);
    } else {
      // Add new variation
      const newVariation = {
        ...variation,
        id: this.generateVariationId()
      };
      this.variationsChanged.emit([...this.variations(), newVariation]);
    }

    // Clear editing state
    this.editingVariation.set(null);
    this.selectedVariationIndex.set(null);
  }

  protected onEditCancelled(): void {
    this.editingVariation.set(null);
    this.selectedVariationIndex.set(null);
  }

  protected onVariationSelected(index: number): void {
    this.selectedVariationIndex.set(
      this.selectedVariationIndex() === index ? null : index
    );
  }

  protected onVariationEdit(index: number): void {
    const variation = this.variations()[index];
    if (variation) {
      this.editingVariation.set({...variation});
      this.selectedVariationIndex.set(index);
    }
  }

  protected onVariationDelete(index: number): void {
    const updatedVariations = this.variations().filter((_, i) => i !== index);
    this.variationsChanged.emit(updatedVariations);

    // Clear selection if deleted variation was selected
    if (this.selectedVariationIndex() === index) {
      this.selectedVariationIndex.set(null);
      this.editingVariation.set(null);
    }
  }

  protected onBulkToggleActive(makeActive: boolean): void {
    const updatedVariations = this.variations().map(variation => ({
      ...variation,
      is_active: makeActive
    }));
    this.variationsChanged.emit(updatedVariations);
  }

  protected onClearAllVariations(): void {
    this.variationsChanged.emit([]);
    this.selectedVariationIndex.set(null);
    this.editingVariation.set(null);
    this.availableAttributes.set([]);
  }

  // UI helpers
  protected toggleExpanded(): void {
    this.isExpanded.update(expanded => !expanded);
  }

  // Statistics
  protected getActiveCount(): number {
    return this.variations().filter(v => v.is_active).length;
  }

  protected getTotalStock(): number {
    return this.variations().reduce((total, variation) =>
      total + (variation.stock_quantity || 0), 0);
  }

  protected getAveragePrice(): number {
    const variations = this.variations();
    if (variations.length === 0) return this.basePrice();

    const totalPrice = variations.reduce((total, variation) =>
      total + this.basePrice() + (variation.price_adjustment || 0), 0);

    return totalPrice / variations.length;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  private generateVariationId(): string {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize available attributes from existing variations
  ngOnInit(): void {
    this.initializeAttributesFromVariations();
  }

  private initializeAttributesFromVariations(): void {
    const existingAttributes = new Set<string>();

    this.variations().forEach(variation => {
      Object.keys(variation.attributes || {}).forEach(attr => {
        existingAttributes.add(attr);
      });
    });

    this.availableAttributes.set(Array.from(existingAttributes));
  }
}
