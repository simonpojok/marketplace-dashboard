import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Product, Category, Brand } from '../../models/product.model';
import { ToastService } from '../../../../core/services/toast.service';
import { BasicInfoFormComponent } from '../../components/basic-info-form/basic-info-form.component';
import { PricingInventoryFormComponent } from '../../components/pricing-inventory-form/pricing-inventory-form.component';
import { ProductImagesFormComponent } from '../../components/product-images-form/product-images-form.component';
import { ProductVariationsFormComponent } from '../../components/product-variations-form/product-variations-form.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    BasicInfoFormComponent,
    PricingInventoryFormComponent,
    ProductImagesFormComponent,
    ProductVariationsFormComponent
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

  // Form controls
  protected productForm!: FormGroup;

  // File uploads
  protected uploadedImages: { file: File, preview: string }[] = [];

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

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add basic form fields
    const productData = this.prepareProductData();
    for (const key in productData) {
      if (key !== 'images' && key !== 'variations') {
        formData.append(key, productData[key]);
      }
    }

    // Add images - handle both file uploads and URLs
    this.processImagesForFormData(formData);

    // Add variations
    this.processVariationsForFormData(formData);

    if (this.isEdit()) {
      this.updateProduct(formData);
    } else {
      this.createProduct(formData);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          this.markFormGroupTouched(control.at(i) as FormGroup);
        }
      } else if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private processImagesForFormData(formData: FormData): void {
    const imagesArray = this.productForm.get('images') as FormArray;

    for (let i = 0; i < imagesArray.length; i++) {
      const imageGroup = imagesArray.at(i) as FormGroup;
      const imageId = imageGroup.get('id')?.value;

      if (imageId) {
        formData.append(`images[${i}][id]`, imageId);
      }

      const uploadedImage = this.uploadedImages.find(img => img.preview === imageGroup.get('image')?.value);

      if (uploadedImage) {
        formData.append(`images[${i}][image]`, uploadedImage.file);
      } else {
        formData.append(`images[${i}][image]`, imageGroup.get('image')?.value || '');
      }

      formData.append(`images[${i}][alt_text]`, imageGroup.get('alt_text')?.value || '');
      formData.append(`images[${i}][is_primary]`, imageGroup.get('is_primary')?.value ? 'true' : 'false');
      formData.append(`images[${i}][display_order]`, imageGroup.get('display_order')?.value || '0');
    }
  }

  private processVariationsForFormData(formData: FormData): void {
    const variationsArray = this.productForm.get('variations') as FormArray;

    for (let i = 0; i < variationsArray.length; i++) {
      const variationGroup = variationsArray.at(i) as FormGroup;
      const variationData = variationGroup.value;

      if (variationData.id) {
        formData.append(`variations[${i}][id]`, variationData.id);
      }

      for (const key in variationData) {
        if (key !== 'id' && variationData[key] !== null && variationData[key] !== '') {
          formData.append(`variations[${i}][${key}]`, variationData[key]);
        }
      }

      const variationImage = variationGroup.get('image')?.value;
      if (variationImage && this.uploadedImages.some(img => img.preview === variationImage)) {
        const uploadedImage = this.uploadedImages.find(img => img.preview === variationImage);
        if (uploadedImage) {
          formData.append(`variations[${i}][image]`, uploadedImage.file);
        }
      }
    }
  }

  private updateProduct(formData: FormData): void {
    this.productsService.handleUpdateProduct(this.product()!.id, formData).subscribe({
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
  }

  private createProduct(formData: FormData): void {
    this.productsService.handleCreateProduct(formData).subscribe({
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

  private prepareProductData(): any {
    const formData = {...this.productForm.value};

    if (!formData.slug) {
      delete formData.slug;
    }

    if (!formData.sku) {
      delete formData.sku;
    }

    if (!formData.brand) {
      delete formData.brand;
    }

    if (formData.variations && formData.variations.length > 0) {
      formData.variations = formData.variations.map((variation: any) => {
        if (!variation.size) delete variation.size;
        if (!variation.color) delete variation.color;
        if (!variation.color_code) delete variation.color_code;
        if (!variation.custom_attribute) delete variation.custom_attribute;
        return variation;
      });
    }

    return formData;
  }

  // Image handling
  protected createImageFormGroup(image: any = null): FormGroup {
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

  protected onImageFilesSelected(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.match('image.*')) continue;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const preview = event.target.result;

        this.uploadedImages.push({ file, preview });

        const imageGroup = this.createImageFormGroup();
        imageGroup.patchValue({
          image: preview,
          alt_text: file.name.split('.')[0],
          is_primary: this.imagesFormArray.length === 0
        });

        this.imagesFormArray.push(imageGroup);
      };

      reader.readAsDataURL(file);
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.onImageFilesSelected(event.dataTransfer.files);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected addImage(): void {
    this.imagesFormArray.push(this.createImageFormGroup());
  }

  protected removeImage(index: number): void {
    const imageControl = this.imagesFormArray.at(index);
    const imageUrl = imageControl.get('image')?.value;

    const uploadedImageIndex = this.uploadedImages.findIndex(img => img.preview === imageUrl);
    if (uploadedImageIndex !== -1) {
      this.uploadedImages.splice(uploadedImageIndex, 1);
    }

    this.imagesFormArray.removeAt(index);
  }

  protected setPrimaryImage(index: number): void {
    const imagesArray = this.imagesFormArray;
    for (let i = 0; i < imagesArray.length; i++) {
      imagesArray.at(i).get('is_primary')?.setValue(i === index);
    }
  }

  protected handleVariationImageUpload(event: Event, variationIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.match('image.*')) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const preview = e.target.result;

      this.uploadedImages.push({ file, preview });

      const variationGroup = this.variationsFormArray.at(variationIndex) as FormGroup;
      variationGroup.get('image')?.setValue(preview);
    };

    reader.readAsDataURL(file);
  }

  // Variation handling
  protected createVariationFormGroup(variation: any = null): FormGroup {
    return this.fb.group({
      id: [variation?.id || null],
      sku: [variation?.sku || ''],
      type: [variation?.type || 'size'],
      size: [variation?.size || ''],
      color: [variation?.color || ''],
      color_code: [variation?.color_code || ''],
      screen_size: [variation?.screen_size || ''],
      memory: [variation?.memory || ''],
      storage: [variation?.storage || ''],
      processor: [variation?.processor || ''],
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
      this.addVariation();
    }
  }

  // Helper methods for template
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

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
