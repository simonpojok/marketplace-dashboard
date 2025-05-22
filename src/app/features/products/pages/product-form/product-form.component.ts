import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Product, Category, Brand} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';
import {ProductBasicInfoComponent} from '../../components/product-basic-info/product-basic-info.component';
import {ProductPricingComponent} from '../../components/product-pricing/product-pricing.component';
import {ProductImagesComponent} from '../../components/product-images/product-images.component';
import {ProductVariationsComponent} from '../../components/product-variations/product-variations.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ProductBasicInfoComponent,
    ProductPricingComponent,
    ProductImagesComponent,
    ProductVariationsComponent
  ],
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
  protected imageFiles = signal<File[]>([]);
  protected removedImageIds = signal<string[]>([]);

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
      this.markFormGroupTouched(this.productForm);
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
          this.router.navigate(['/products/view', product.id]);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.toastService.error('Failed to create product');
          this.isSaving.set(false);
        }
      });
    }
  }

  private prepareProductData(): FormData {
    const formData = new FormData();
    const formValue = this.productForm.value;

    // Add basic product data
    Object.keys(formValue).forEach(key => {
      if (key !== 'images' && key !== 'variations' && formValue[key] !== null && formValue[key] !== '') {
        if (key === 'has_variations' || key === 'is_active' || key === 'is_featured') {
          formData.append(key, formValue[key].toString());
        } else {
          formData.append(key, formValue[key]);
        }
      }
    });

    // Add image files
    this.imageFiles().forEach((file, index) => {
      formData.append(`image_files`, file);
    });

    // Add image data (URLs and metadata)
    if (formValue.images && formValue.images.length > 0) {
      formData.append('images', JSON.stringify(formValue.images));
    }

    // Add variations data
    if (formValue.variations && formValue.variations.length > 0) {
      const cleanedVariations = formValue.variations.map((variation: any) => {
        const cleaned = {...variation};
        // Remove empty fields
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] === '' || cleaned[key] === null) {
            delete cleaned[key];
          }
        });
        return cleaned;
      });
      formData.append('variations', JSON.stringify(cleanedVariations));
    }

    // Add removed image IDs for update operations
    if (this.isEdit() && this.removedImageIds().length > 0) {
      formData.append('removed_image_ids', JSON.stringify(this.removedImageIds()));
    }

    return formData;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private createImageFormGroup(image: any = null): FormGroup {
    return this.fb.group({
      id: [image?.id || null],
      image: [image?.image || ''],
      alt_text: [image?.alt_text || ''],
      is_primary: [image?.is_primary || false],
      display_order: [image?.display_order || 0],
      file: [null] // For new file uploads
    });
  }

  private createVariationFormGroup(variation: any = null): FormGroup {
    return this.fb.group({
      id: [variation?.id || null],
      sku: [variation?.sku || ''],
      size: [variation?.size || ''],
      color: [variation?.color || ''],
      color_code: [variation?.color_code || ''],
      memory: [variation?.memory || ''],
      storage: [variation?.storage || ''],
      custom_attribute: [variation?.custom_attribute || ''],
      price_adjustment: [variation?.price_adjustment || 0],
      stock_quantity: [variation?.stock_quantity || 0, [Validators.required, Validators.min(0)]],
      image: [variation?.image || ''],
      is_active: [variation?.is_active ?? true]
    });
  }

  private ensureVariationsExist(): void {
    const variationsArray = this.productForm.get('variations') as FormArray;
    if (variationsArray.length === 0) {
      variationsArray.push(this.createVariationFormGroup());
    }
  }

  // Event handlers for child components
  protected onImageFilesChanged(files: File[]): void {
    this.imageFiles.set(files);
  }

  protected onImageRemoved(imageId: string): void {
    if (imageId) {
      this.removedImageIds.update(ids => [...ids, imageId]);
    }
  }

  // Getters for child components
  protected get imagesFormArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  protected get variationsFormArray(): FormArray {
    return this.productForm.get('variations') as FormArray;
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

  protected discountPercentage(): number {
    const price = this.productForm.get('price')?.value || 0;
    const discountPrice = this.productForm.get('discount_price')?.value;

    if (price > 0 && discountPrice != null && discountPrice > 0 && discountPrice < price) {
      return Math.round(((price - discountPrice) / price) * 100);
    }
    return 0;
  }
}
