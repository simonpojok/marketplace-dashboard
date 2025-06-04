import {Component, input, output, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {VARIATION_ATTRIBUTES, VariationAttribute} from '../../models/product-variation.model';

@Component({
  selector: 'app-variation-attribute-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          Product Attributes
        </h4>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {{ selectedAttributes().length }} selected
        </div>
      </div>

      <!-- Attribute Categories -->
      <div class="space-y-3">
        <div *ngFor="let category of attributeCategories"
             class="border border-gray-200 dark:border-gray-700 rounded-lg">
          <!-- Category Header -->
          <button
            type="button"
            (click)="toggleCategory(category.name)"
            class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ category.label }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-500 transition-transform duration-200"
              [class.rotate-180]="expandedCategories()[category.name]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Category Attributes -->
          <div
            *ngIf="expandedCategories()[category.name]"
            class="px-4 pb-3 grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-700 pt-3"
          >
            <label
              *ngFor="let attrKey of category.attributes"
              class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                [checked]="selectedAttributes().includes(attrKey)"
                (change)="toggleAttribute(attrKey, $event)"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              >
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ getAttributeLabel(attrKey) }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Selected Attributes Summary -->
      <div *ngIf="selectedAttributes().length > 0" class="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <div class="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
          Selected Attributes:
        </div>
        <div class="flex flex-wrap gap-1">
          <span
            *ngFor="let attr of selectedAttributes()"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
          >
            {{ getAttributeLabel(attr) }}
            <button
              type="button"
              (click)="removeAttribute(attr)"
              class="ml-1 p-0.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-700"
            >
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VariationAttributeSelectorComponent {
  // Inputs
  selectedAttributes = input<string[]>([]);

  // Outputs
  attributeSelected = output<string>();
  attributeRemoved = output<string>();

  // State
  protected expandedCategories = signal<{ [key: string]: boolean }>({
    'apparel': true, // Default expand apparel
    'electronics': false,
    'home': false,
    'kitchen': false,
    'beauty': false,
    'universal': false
  });

  // Attribute categories for better organization
  protected attributeCategories = [
    {
      name: 'apparel',
      label: 'Apparel & Footwear',
      attributes: ['size', 'color', 'material', 'fit', 'pattern']
    },
    {
      name: 'electronics',
      label: 'Electronics',
      attributes: ['storage', 'ram', 'screen_size', 'processor', 'operating_system', 'connectivity']
    },
    {
      name: 'home',
      label: 'Home & Furniture',
      attributes: ['dimensions', 'finish', 'style']
    },
    {
      name: 'kitchen',
      label: 'Kitchen & Appliances',
      attributes: ['capacity', 'power', 'voltage']
    },
    {
      name: 'beauty',
      label: 'Beauty & Personal Care',
      attributes: ['fragrance', 'skin_type']
    },
    {
      name: 'universal',
      label: 'Universal',
      attributes: ['warranty', 'brand_model', 'certification', 'custom']
    }
  ];

  protected toggleCategory(categoryName: string): void {
    this.expandedCategories.update(expanded => ({
      ...expanded,
      [categoryName]: !expanded[categoryName]
    }));
  }

  protected toggleAttribute(attributeKey: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.attributeSelected.emit(attributeKey);
    } else {
      this.attributeRemoved.emit(attributeKey);
    }
  }

  protected removeAttribute(attributeKey: string): void {
    this.attributeRemoved.emit(attributeKey);
  }

  protected getAttributeLabel(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.label || key;
  }
}
