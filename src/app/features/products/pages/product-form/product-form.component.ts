import {Component, OnInit, inject, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Product, Category, Brand} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';
import {ProductImage} from '../models/product-image.models';
import {ProductVariation, VARIATION_ATTRIBUTES, VariationAttribute} from '../../models/product-variation.model';
import {ProductVideo} from '../../models/product-video.model';
import {ProductVideoManagerComponent} from '../../components/product-video-manager/product-video-manager.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ProductVideoManagerComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected isEdit = signal(false);
  protected product = signal<Product | null>(null);
  protected categories = signal<Category[]>([]);
  protected brands = signal<Brand[]>([]);
  protected hasVariations = signal(false);
  protected dragOver = signal(false);

  // Form and data
  protected productForm!: FormGroup;
  protected images = signal<ProductImage[]>([]);
  protected videos = signal<ProductVideo[]>([]);
  protected variations = signal<ProductVariation[]>([]);
  protected removedImageIds = signal<string[]>([]);

  // Variation management state
  protected isVariationManagerExpanded = signal(true);
  protected availableAttributes = signal<string[]>([]);
  protected selectedVariationIndex = signal<number | null>(null);
  protected editingVariation = signal<ProductVariation | null>(null);

  // Attribute selector state
  protected expandedCategories = signal<{ [key: string]: boolean }>({
    'apparel': true,
    'electronics': false,
    'home': false,
    'kitchen': false,
    'beauty': false,
    'universal': false
  });

  // Variation form state
  protected variationFormData = signal<Partial<ProductVariation>>({
    sku: '',
    attributes: {},
    price_adjustment: 0,
    stock_quantity: 0,
    image_url: '',
    is_active: true
  });

  // Track custom input states for each attribute
  protected customInputStates = signal<{ [key: string]: boolean }>({});
  protected customInputValues = signal<{ [key: string]: string }>({});
  protected customAttributeNames = signal<{ [key: string]: string }>({});

  // Computed values
  protected isVariationEdit = computed(() => !!this.editingVariation());

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

  ngOnInit(): void {
    this.initForm();
    this.loadFormDependencies();

    // Check if we're in edit mode
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEdit.set(true);
      this.loadProduct(productId);
    } else {
      this.isLoading.set(false);
    }

    // Watch for "has variations" changes with debounce to prevent freezing
    this.productForm.get('has_variations')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(hasVariations => {
      this.hasVariations.set(hasVariations);
      if (!hasVariations) {
        this.variations.set([]);
        this.availableAttributes.set([]);
        this.resetVariationForm();
      }
    });

    // Initialize variation form
    this.resetVariationForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: [''],
      sku: [''],
      category: ['', Validators.required],
      brand: [''],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      discount_price: [null],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      has_variations: [false],
      is_active: [true],
      is_featured: [false]
    });
  }

  private loadFormDependencies(): void {
    // Load categories and brands
    this.productsService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.error('Failed to load categories');
      }
    });

    this.productsService.getBrands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: (error) => {
        console.error('Error loading brands:', error);
        this.toastService.error('Failed to load brands');
      }
    });
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.populateForm(product);
        this.hasVariations.set(product.has_variations);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.toastService.error('Failed to load product details');
        this.isLoading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      brand: product.brand || '',
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      stock_quantity: product.stock_quantity,
      has_variations: product.has_variations,
      is_active: product.is_active,
      is_featured: product.is_featured
    });

    // Load images
    if (product.images && product.images.length > 0) {
      const productImages: ProductImage[] = product.images.map(img => ({
        id: img.id,
        url: img.image,
        alt_text: img.alt_text || '',
        is_primary: img.is_primary,
        display_order: img.display_order,
        preview: img.image
      }));
      this.images.set(productImages);
    }

    // Load videos
    if (product.videos && product.videos.length > 0) {
      this.videos.set(product.videos);
    }

    // Load variations and initialize attributes
    if (product.variations && product.variations.length > 0) {
      this.variations.set(product.variations);
      this.initializeAttributesFromVariations();
    }
  }

  // ==========================================
  // VARIATION MANAGER METHODS
  // ==========================================

  protected toggleVariationManager(): void {
    this.isVariationManagerExpanded.update(expanded => !expanded);
  }

  protected getActiveVariationsCount(): number {
    return this.variations().filter(v => v.is_active).length;
  }

  protected getTotalVariationsStock(): number {
    return this.variations().reduce((total, variation) =>
      total + (variation.stock_quantity || 0), 0);
  }

  protected getAverageVariationPrice(): number {
    const variations = this.variations();
    if (variations.length === 0) return this.productForm.get('price')?.value || 0;

    const totalPrice = variations.reduce((total, variation) =>
      total + (this.productForm.get('price')?.value || 0) + (variation.price_adjustment || 0), 0);

    return totalPrice / variations.length;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // ==========================================
  // ATTRIBUTE SELECTOR METHODS
  // ==========================================

  protected toggleAttributeCategory(categoryName: string): void {
    this.expandedCategories.update(expanded => ({
      ...expanded,
      [categoryName]: !expanded[categoryName]
    }));
  }

  protected toggleAttribute(attributeKey: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.onAttributeSelected(attributeKey);
    } else {
      this.onAttributeRemoved(attributeKey);
    }
  }

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

    this.variations.set(updatedVariations);

    // Clear custom states for this attribute
    this.customInputStates.update(states => {
      const newStates = {...states};
      delete newStates[attributeKey];
      return newStates;
    });

    this.customInputValues.update(values => {
      const newValues = {...values};
      delete newValues[attributeKey];
      return newValues;
    });

    this.customAttributeNames.update(names => {
      const newNames = {...names};
      delete newNames[attributeKey];
      return newNames;
    });
  }

  protected removeAttribute(attributeKey: string): void {
    this.onAttributeRemoved(attributeKey);
  }

  protected getAttributeLabel(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.label || key;
  }

  private initializeAttributesFromVariations(): void {
    const existingAttributes = new Set<string>();
    const customStates: { [key: string]: boolean } = {};
    const customValues: { [key: string]: string } = {};
    const customNames: { [key: string]: string } = {};

    this.variations().forEach(variation => {
      Object.entries(variation.attributes || {}).forEach(([attr, value]) => {
        existingAttributes.add(attr);

        // Check if it's a custom value
        if (value.startsWith('Custom:')) {
          customStates[attr] = true;
          if (attr === 'custom') {
            // For custom attribute, parse name:value format
            const customParts = value.replace('Custom:', '').split(':');
            if (customParts.length >= 2) {
              customNames[attr] = customParts[0].trim();
              customValues[attr] = customParts.slice(1).join(':').trim();
            }
          } else {
            customValues[attr] = value.replace('Custom:', '').trim();
          }
        }
      });
    });

    this.availableAttributes.set(Array.from(existingAttributes));
    this.customInputStates.set(customStates);
    this.customInputValues.set(customValues);
    this.customAttributeNames.set(customNames);
  }

  // ==========================================
  // VARIATION FORM METHODS
  // ==========================================

  protected updateVariationAttribute(attributeKey: string, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;

    if (value === 'Custom') {
      // Set custom input state to true
      this.customInputStates.update(states => ({
        ...states,
        [attributeKey]: true
      }));

      // Initialize with empty custom value
      this.updateVariationFormAttribute(attributeKey, '');
    } else {
      // Clear custom input state
      this.customInputStates.update(states => ({
        ...states,
        [attributeKey]: false
      }));

      // Set the selected value
      this.updateVariationFormAttribute(attributeKey, value);
    }
  }

  protected updateCustomVariationValue(attributeKey: string, event: Event): void {
    const customValue = (event.target as HTMLInputElement).value;

    this.customInputValues.update(values => ({
      ...values,
      [attributeKey]: customValue
    }));

    if (attributeKey === 'custom') {
      // For custom attribute, combine name and value
      const customName = this.customAttributeNames()[attributeKey] || '';
      const formattedValue = customName && customValue
        ? `Custom:${customName}:${customValue}`
        : '';
      this.updateVariationFormAttribute(attributeKey, formattedValue);
    } else {
      // For other attributes, just store the custom value
      const formattedValue = customValue.trim() ? `Custom:${customValue.trim()}` : '';
      this.updateVariationFormAttribute(attributeKey, formattedValue);
    }
  }

  protected updateCustomAttributeName(event: Event): void {
    const customName = (event.target as HTMLInputElement).value;

    this.customAttributeNames.update(names => ({
      ...names,
      'custom': customName
    }));

    // Update the variation form attribute with combined name:value
    const customValue = this.customInputValues()['custom'] || '';
    const formattedValue = customName && customValue
      ? `Custom:${customName}:${customValue}`
      : '';
    this.updateVariationFormAttribute('custom', formattedValue);
  }

  protected updateColorVariationAttribute(attributeKey: string, event: Event): void {
    const colorValue = (event.target as HTMLInputElement).value;
    const colorName = this.getColorName(colorValue);

    // Update both the color and the text input if it's empty
    const currentValue = this.variationFormData().attributes?.[attributeKey] || '';
    if (!currentValue || currentValue === colorName) {
      this.updateVariationFormAttribute(attributeKey, `${colorName} ${colorValue}`);
    } else {
      // If there's already a value, just update the color part
      const updatedValue = currentValue.replace(/#[0-9A-Fa-f]{6}/, colorValue);
      this.updateVariationFormAttribute(attributeKey, `${updatedValue} ${colorValue}`);
    }
  }

  protected updateVariationField(field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    let value: any = target.value;

    // Convert to appropriate type
    if (field === 'price_adjustment' || field === 'stock_quantity') {
      value = parseFloat(value) || 0;
    } else if (field === 'is_active') {
      value = target.checked;
    }

    this.variationFormData.update(data => ({
      ...data,
      [field]: value
    }));
  }

  private updateVariationFormAttribute(attributeKey: string, value: string): void {
    this.variationFormData.update(data => ({
      ...data,
      attributes: {
        ...data.attributes,
        [attributeKey]: value
      }
    }));
  }

  protected saveVariation(): void {
    if (!this.isVariationFormValid()) return;

    const data = this.variationFormData();

    // Generate SKU if not provided
    if (!data.sku?.trim()) {
      data.sku = this.generateVariationSKU();
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

    if (variation.id) {
      // Update existing variation
      const updatedVariations = this.variations().map(v =>
        v.id === variation.id ? variation : v
      );
      this.variations.set(updatedVariations);
    } else {
      // Add new variation
      const newVariation = {
        ...variation,
        id: this.generateVariationId()
      };
      this.variations.set([...this.variations(), newVariation]);
    }

    // Clear editing state
    this.editingVariation.set(null);
    this.selectedVariationIndex.set(null);

    if (!this.isVariationEdit()) {
      this.resetVariationForm();
    }
  }

  protected resetVariationForm(): void {
    const defaultAttributes: { [key: string]: string } = {};

    // Initialize attributes with empty values
    this.availableAttributes().forEach(attr => {
      defaultAttributes[attr] = '';
    });

    this.variationFormData.set({
      sku: '',
      attributes: defaultAttributes,
      price_adjustment: 0,
      stock_quantity: 0,
      image_url: '',
      is_active: true
    });

    // Reset custom input states
    this.customInputStates.set({});
    this.customInputValues.set({});
    this.customAttributeNames.set({});
  }

  protected cancelVariationEdit(): void {
    this.editingVariation.set(null);
    this.selectedVariationIndex.set(null);
    this.resetVariationForm();
  }

  protected isVariationFormValid(): boolean {
    const data = this.variationFormData();

    // Check if at least one attribute has a value
    const hasAttributes = Object.values(data.attributes || {}).some(value => value.trim() !== '');

    // Check required fields
    const hasRequiredFields = (data.stock_quantity || 0) >= 0;

    return hasAttributes && hasRequiredFields;
  }

  protected getVariationAttributeType(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.type || 'text';
  }

  protected getVariationAttributeOptions(key: string): string[] {
    const options = VARIATION_ATTRIBUTES[key]?.options || [];
    // Add "Custom" option to all select fields except the dedicated custom field
    if (key !== 'custom' && options.length > 0) {
      return [...options, 'Custom'];
    }
    return options;
  }

  protected isCustomInputActive(attributeKey: string): boolean {
    return this.customInputStates()[attributeKey] || false;
  }

  protected getCustomInputValue(attributeKey: string): string {
    return this.customInputValues()[attributeKey] || '';
  }

  protected getCustomAttributeName(): string {
    return this.customAttributeNames()['custom'] || '';
  }

  protected getVariationSelectValue(attributeKey: string): string {
    const currentValue = this.variationFormData().attributes?.[attributeKey];

    // If it's a custom value, return "Custom" for the select
    if (currentValue && currentValue.startsWith('Custom:')) {
      return 'Custom';
    }

    return currentValue || '';
  }

  protected getVariationColorValue(colorName: string): string {
    // Extract hex color from the color name string
    const hexMatch = colorName.match(/#[0-9A-Fa-f]{6}/);
    if (hexMatch) {
      return hexMatch[0];
    }

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

    return colorMap[hexColor.toLowerCase()] || 'Custom Color';
  }

  private generateVariationSKU(): string {
    const attributes = this.variationFormData().attributes || {};
    const attrValues = Object.values(attributes)
      .filter(value => value.trim() !== '')
      .map(value => {
        // Handle custom attributes
        if (value.startsWith('Custom:')) {
          const customPart = value.replace('Custom:', '');
          return customPart.substring(0, 3).toUpperCase();
        }
        return value.substring(0, 2).toUpperCase();
      })
      .join('-');

    const timestamp = Date.now().toString().slice(-4);
    return `VAR-${attrValues || 'DEFAULT'}-${timestamp}`;
  }

  private generateVariationId(): string {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================
  // VARIATION LIST METHODS
  // ==========================================

  protected selectVariation(index: number): void {
    this.selectedVariationIndex.set(
      this.selectedVariationIndex() === index ? null : index
    );
  }

  protected editVariation(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const variation = this.variations()[index];
    if (variation) {
      this.editingVariation.set({...variation});
      this.selectedVariationIndex.set(index);

      // Populate variation form with editing data
      this.variationFormData.set({...variation});

      // Set up custom input states for editing
      const customStates: { [key: string]: boolean } = {};
      const customValues: { [key: string]: string } = {};
      const customNames: { [key: string]: string } = {};

      Object.entries(variation.attributes || {}).forEach(([key, value]) => {
        if (value.startsWith('Custom:')) {
          customStates[key] = true;

          if (key === 'custom') {
            // Parse custom attribute name:value format
            const customParts = value.replace('Custom:', '').split(':');
            if (customParts.length >= 2) {
              customNames[key] = customParts[0].trim();
              customValues[key] = customParts.slice(1).join(':').trim();
            }
          } else {
            customValues[key] = value.replace('Custom:', '').trim();
          }
        }
      });

      this.customInputStates.set(customStates);
      this.customInputValues.set(customValues);
      this.customAttributeNames.set(customNames);
    }
  }

  protected deleteVariation(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('Are you sure you want to delete this variation?')) {
      const updatedVariations = this.variations().filter((_, i) => i !== index);
      this.variations.set(updatedVariations);

      // Clear selection if deleted variation was selected
      if (this.selectedVariationIndex() === index) {
        this.selectedVariationIndex.set(null);
        this.editingVariation.set(null);
      }
    }
  }

  protected toggleAllVariationsActive(): void {
    const makeActive = !this.allVariationsActive();
    const updatedVariations = this.variations().map(variation => ({
      ...variation,
      is_active: makeActive
    }));
    this.variations.set(updatedVariations);
  }

  protected clearAllVariations(): void {
    if (confirm('Are you sure you want to remove all variations?')) {
      this.variations.set([]);
      this.selectedVariationIndex.set(null);
      this.editingVariation.set(null);
      this.availableAttributes.set([]);
    }
  }

  protected allVariationsActive(): boolean {
    return this.variations().length > 0 && this.variations().every(v => v.is_active);
  }

  protected getVariationDisplayName(variation: ProductVariation): string {
    const attributeStrings = Object.entries(variation.attributes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => `${this.getAttributeLabel(key)}: ${this.formatAttributeValue(value)}`);

    return attributeStrings.length > 0 ? attributeStrings.join(', ') : 'No attributes';
  }

  protected getVariationAttributeList(attributes: { [key: string]: string }): Array<{ label: string, value: string }> {
    return Object.entries(attributes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => ({
        label: this.getAttributeLabel(key),
        value: this.formatAttributeValue(value)
      }));
  }

  protected formatAttributeValue(value: string): string {
    // Handle custom values
    if (value.startsWith('Custom:')) {
      const customValue = value.replace('Custom:', '');

      // For custom attribute (name:value format)
      if (customValue.includes(':')) {
        const parts = customValue.split(':');
        if (parts.length >= 2) {
          return `${parts[0].trim()}: ${parts.slice(1).join(':').trim()}`;
        }
      }

      return customValue.trim() || 'Custom';
    }
    return value;
  }

  protected calculateVariationFinalPrice(variation: ProductVariation): number {
    return (this.productForm.get('price')?.value || 0) + (variation.price_adjustment || 0);
  }

  protected getVariationStockStatusClass(stockQuantity: number): string {
    if (stockQuantity === 0) return 'out-of-stock';
    if (stockQuantity < 10) return 'low-stock';
    return 'in-stock';
  }

  protected getVariationStockStatusText(stockQuantity: number): string {
    if (stockQuantity === 0) return 'Out of Stock';
    if (stockQuantity < 10) return `Low (${stockQuantity})`;
    return `${stockQuantity}`;
  }

  protected onVariationImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  // ==========================================
  // IMAGE HANDLING METHODS
  // ==========================================

  protected addImage(): void {
    const newImage: ProductImage = {
      alt_text: '',
      is_primary: this.images().length === 0,
      display_order: this.images().length,
      preview: ''
    };
    this.images.update(images => [...images, newImage]);
  }

  protected removeImage(index: number): void {
    const imageToRemove = this.images()[index];
    if (imageToRemove.id) {
      this.removedImageIds.update(ids => [...ids, imageToRemove.id!]);
    }

    this.images.update(images => {
      const newImages = images.filter((_, i) => i !== index);
      // Reorder remaining images
      return newImages.map((img, i) => ({...img, display_order: i}));
    });
  }

  protected onImageFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processImageFile(input.files[0], index);
    }
  }

  protected onImageDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      this.processImageFile(files[0], index);
    }
  }

  private processImageFile(file: File, index: number): void {
    if (file.size > 10 * 1024 * 1024) {
      this.toastService.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.images.update(images => {
        const newImages = [...images];
        newImages[index] = {
          ...newImages[index],
          file: file,
          preview: e.target?.result as string,
          alt_text: newImages[index].alt_text || file.name
        };
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  }

  protected setPrimaryImage(index: number): void {
    this.images.update(images =>
      images.map((img, i) => ({...img, is_primary: i === index}))
    );
  }

  protected onImageTextChange(event: Event, index: number, field: string): void {
    const target = event.target as HTMLInputElement;
    if (field === 'url') {
      this.updateImageUrl(index, target.value);
    } else if (field === 'alt_text') {
      this.updateImageAltText(index, target.value);
    }
  }

  private updateImageAltText(index: number, altText: string): void {
    this.images.update(images => {
      const newImages = [...images];
      newImages[index] = {...newImages[index], alt_text: altText};
      return newImages;
    });
  }

  private updateImageUrl(index: number, url: string): void {
    this.images.update(images => {
      const newImages = [...images];
      newImages[index] = {...newImages[index], url: url, preview: url};
      return newImages;
    });
  }

  // Video management methods
  protected onVideosChanged(videos: ProductVideo[]): void {
    this.videos.set(videos);
  }

  protected getCurrentProductId(): string | null {
    return this.product()?.id || null;
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  // ==========================================
  // FORM SUBMISSION AND UTILITY METHODS
  // ==========================================

  protected handleCreateProduct(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.toastService.warning('Please correct the errors in the form');
      return;
    }

    this.isSaving.set(true);
    const productData = this.prepareProductData();

    const saveObservable = this.isEdit() && this.product()
      ? this.productsService.handleUpdateProduct(this.product()!.id, productData)
      : this.productsService.handleCreateProduct(productData);

    saveObservable.subscribe({
      next: (product) => {
        this.isSaving.set(false);
        const message = this.isEdit() ? 'Product updated successfully' : 'Product created successfully';
        this.toastService.success(message);
        this.router.navigate(['/products/view', product.id]);
      },
      error: (error) => {
        console.error('Error saving product:', error);
        const message = this.isEdit() ? 'Failed to update product' : 'Failed to create product';
        this.toastService.error(message);
        this.isSaving.set(false);
      }
    });
  }

  private prepareProductData(): FormData {
    const formData = new FormData();
    const formValue = this.productForm.value;

    // Add basic product data
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null && formValue[key] !== '') {
        if (key === 'has_variations' || key === 'is_active' || key === 'is_featured') {
          formData.append(key, formValue[key].toString());
        } else {
          formData.append(key, formValue[key]);
        }
      }
    });

    // Add image files
    this.images().forEach((image) => {
      if (image.file) {
        formData.append('image_files', image.file);
      }
    });

    // Add image metadata
    const imageData = this.images().map(img => ({
      id: img.id,
      url: img.url,
      alt_text: img.alt_text,
      is_primary: img.is_primary,
      display_order: img.display_order
    }));
    if (imageData.length > 0) {
      formData.append('images', JSON.stringify(imageData));
    }

    // Add variations data
    if (this.hasVariations() && this.variations().length > 0) {
      formData.append('variations', JSON.stringify(this.variations()));
    }

    // Add removed image IDs for updates
    if (this.isEdit() && this.removedImageIds().length > 0) {
      formData.append('removed_image_ids', JSON.stringify(this.removedImageIds()));
    }

    return formData;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  protected generateSlug(): void {
    const nameControl = this.productForm.get('name');
    const slugControl = this.productForm.get('slug');

    if (nameControl && slugControl && nameControl.value) {
      const slug = nameControl.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      slugControl.setValue(slug);
    }
  }

  protected getDiscountPercentage(): number {
    const price = this.productForm.get('price')?.value || 0;
    const discountPrice = this.productForm.get('discount_price')?.value;

    if (price > 0 && discountPrice != null && discountPrice > 0 && discountPrice < price) {
      return Math.round(((price - discountPrice) / price) * 100);
    }
    return 0;
  }
}
