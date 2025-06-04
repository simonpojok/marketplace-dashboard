import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Product, Category, Brand} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';
import {ProductImage} from '../models/product-image.models';
import {ProductVariation} from '../../models/product-variation.model';
import {VariationManagerComponent} from '../../components';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    VariationManagerComponent
  ],
  templateUrl: './product-form.component.html',
  styles: [`
    .drag-over {
      border-color: #3b82f6 !important;
      background-color: rgba(59, 130, 246, 0.05) !important;
    }

    .image-preview {
      transition: all 0.2s ease-in-out;
    }

    .image-preview:hover {
      transform: scale(1.02);
    }

    @media (max-width: 640px) {
      .grid-responsive {
        grid-template-columns: 1fr !important;
      }
    }
  `]
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
  protected variations = signal<ProductVariation[]>([]);
  protected removedImageIds = signal<string[]>([]);

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
      if (!hasVariations) {
        this.variations.set([]);
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

    // Load variations - convert from old format to new format
    // if (product.variations && product.variations.length > 0) {
    //   const productVariations: ProductVariation[] = product.variations.map(variation => {
    //     const attributes: { [key: string]: string } = {};
    //
    //     // Convert old structure to new attributes structure
    //     if (variation.size) attributes['size'] = variation.size;
    //     if (variation.color) attributes['color'] = variation.color;
    //     if (variation.memory) attributes['ram'] = variation.memory;
    //     if (variation.storage) attributes['storage'] = variation.storage;
    //     if (variation.custom_attribute) attributes['custom'] = variation.custom_attribute;
    //
    //     return {
    //       id: variation.id,
    //       sku: variation.sku,
    //       attributes,
    //       price_adjustment: variation.price_adjustment,
    //       stock_quantity: variation.stock_quantity,
    //       image_url: variation.image || '',
    //       is_active: variation.is_active
    //     };
    //   });
    //   this.variations.set(productVariations);
    // }
  }

  // Variation Management
  protected onVariationsChanged(variations: ProductVariation[]): void {
    this.variations.set(variations);
  }

  // Image handling
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

  protected updateImageAltText(index: number, altText: string): void {
    this.images.update(images => {
      const newImages = [...images];
      newImages[index] = {...newImages[index], alt_text: altText};
      return newImages;
    });
  }

  protected updateImageUrl(index: number, url: string): void {
    this.images.update(images => {
      const newImages = [...images];
      newImages[index] = {...newImages[index], url: url, preview: url};
      return newImages;
    });
  }

  // Form submission
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

  // Utility methods
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

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  // Image handling event handlers
  protected onImageTextChange(event: Event, index: number, field: string): void {
    const target = event.target as HTMLInputElement;
    if (field === 'url') {
      this.updateImageUrl(index, target.value);
    } else if (field === 'alt_text') {
      this.updateImageAltText(index, target.value);
    }
  }
}
