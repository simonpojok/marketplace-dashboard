import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Product, Category, Brand, ProductImage, ProductVariation} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styles: []
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected isEdit = signal(false);
  protected product = signal<Product | null>(null);
  protected categories = signal<Category[]>([]);
  protected brands = signal<Brand[]>([]);
  protected hasVariations = signal(false);

  // Form controls
  protected productForm!: FormGroup;

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

    // Watch for "has variations" changes
    this.productForm.get('has_variations')?.valueChanges.subscribe(hasVariations => {
      this.hasVariations.set(hasVariations);
      if (hasVariations) {
        this.ensureVariationsExist();
      }
    });
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
      is_featured: [false],
      images: this.fb.array([]),
      variations: this.fb.array([])
    });
  }

  private loadFormDependencies(): void {
    // Load categories and brands in parallel
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.error('Failed to load categories');
      }
    });

    this.productsService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
      },
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
    // Update form with product data
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

    // Add images
    const imagesArray = this.productForm.get('images') as FormArray;
    imagesArray.clear();
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        imagesArray.push(this.createImageFormGroup(image));
      });
    }

    // Add variations
    const variationsArray = this.productForm.get('variations') as FormArray;
    variationsArray.clear();
    if (product.variations && product.variations.length > 0) {
      product.variations.forEach(variation => {
        variationsArray.push(this.createVariationFormGroup(variation));
      });
    }
  }

  protected handleCreateProduct(): void {
    if (this.productForm.invalid) {
      // Mark all fields as touched to display error messages
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });

      this.toastService.warning('Please correct the errors in the form');
      return;
    }

    this.isSaving.set(true);
    const productData = this.prepareProductData();

    if (this.isEdit()) {
      // Update existing product
      this.productsService.handleUpdateProduct(this.product()!.id, productData).subscribe({
        next: (product) => {
          this.isSaving.set(false);
          this.toastService.success('Product updated successfully');
          this.router.navigate(['/products/view', product.id]);
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.toastService.error('Failed to update product');
          this.isSaving.set(false);
        }
      });
    } else {
      // Create new product
      this.productsService.handleCreateProduct(productData).subscribe({
        next: (product) => {
          this.isSaving.set(false);
          this.toastService.success('Product created successfully');
          this.router.navigate(['/products/view', product.id]).then(console.log);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.toastService.error('Failed to create product');
          this.isSaving.set(false);
        }
      });
    }
  }

  private prepareProductData(): any {
    const formData = {...this.productForm.value};

    // If slug is empty, it will be auto-generated by the server
    if (!formData.slug) {
      delete formData.slug;
    }

    // If SKU is empty, it will be auto-generated by the server
    if (!formData.sku) {
      delete formData.sku;
    }

    // Remove empty brand
    if (!formData.brand) {
      delete formData.brand;
    }

    // Format variations data correctly
    if (formData.variations && formData.variations.length > 0) {
      formData.variations = formData.variations.map((variation: any) => {
        // Remove null or empty fields
        if (!variation.size) {
          delete variation.size;
        }
        if (!variation.color) {
          delete variation.color;
        }
        if (!variation.color_code) {
          delete variation.color_code;
        }
        if (!variation.custom_attribute) {
          delete variation.custom_attribute;
        }
        return variation;
      });
    }

    return formData;
  }

  // Image handling
  protected createImageFormGroup(image: ProductImage | null = null): FormGroup {
    return this.fb.group({
      id: [image?.id || null],
      image: [image?.image || '', Validators.required],
      alt_text: [image?.alt_text || ''],
      is_primary: [image?.is_primary || false],
      display_order: [image?.display_order || 0]
    });
  }

  protected get imagesFormArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  protected addImage(): void {
    this.imagesFormArray.push(this.createImageFormGroup());
  }

  protected removeImage(index: number): void {
    this.imagesFormArray.removeAt(index);
  }

  protected setPrimaryImage(index: number): void {
    const imagesArray = this.imagesFormArray;
    for (let i = 0; i < imagesArray.length; i++) {
      imagesArray.at(i).get('is_primary')?.setValue(i === index);
    }
  }

  // Variation handling
  protected createVariationFormGroup(variation: ProductVariation | null = null): FormGroup {
    return this.fb.group({
      id: [variation?.id || null],
      sku: [variation?.sku || ''],
      size: [variation?.size || ''],
      color: [variation?.color || ''],
      color_code: [variation?.color_code || ''],
      custom_attribute: [variation?.custom_attribute || ''],
      price_adjustment: [variation?.price_adjustment || 0],
      stock_quantity: [variation?.stock_quantity || 0, [Validators.required, Validators.min(0)]],
      image: [variation?.image || null],
      is_active: [variation?.is_active ?? true]
    });
  }

  protected get variationsFormArray(): FormArray {
    return this.productForm.get('variations') as FormArray;
  }

  protected addVariation(): void {
    this.variationsFormArray.push(this.createVariationFormGroup());
  }

  protected removeVariation(index: number): void {
    this.variationsFormArray.removeAt(index);
  }

  private ensureVariationsExist(): void {
    if (this.variationsFormArray.length === 0) {
      this.addVariation(); // Add at least one variation
    }
  }

  // Helper methods for template
  protected generateSlug(): void {
    const nameControl = this.productForm.get('name');
    const slugControl = this.productForm.get('slug');

    if (nameControl && slugControl && nameControl.value) {
      // Basic slug generation: lowercase, replace spaces with dashes, remove special chars
      const slug = nameControl.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      slugControl.setValue(slug);
    }
  }

  protected discountPercentage(): number {
    const price = this.productForm.get('price')?.value || 0;
    const discountPrice = this.productForm.get('discount_price')?.value;

    if (price > 0 && discountPrice != null && discountPrice > 0 && discountPrice < price) {
      return Math.round(((price - discountPrice) / price) * 100);
    }
    return 0;
  }

  protected getSizeChoices(): { value: string, label: string }[] {
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

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
