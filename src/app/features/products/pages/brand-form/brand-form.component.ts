import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Brand} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './brand-form.component.html',
  styles: []
})
export class BrandFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected isEditMode = signal(false);
  protected brand = signal<Brand | null>(null);
  protected selectedImage: File | null = null;
  protected imagePreview = signal<string | null>(null);

  // Form group
  protected brandForm!: FormGroup;

  ngOnInit(): void {
    // Initialize form
    this.initForm();

    // Check if we're in edit mode
    const brandId = this.route.snapshot.paramMap.get('id');
    if (brandId) {
      this.isEditMode.set(true);
      this.loadBrand(brandId);
    } else {
      this.isLoading.set(false);
    }
  }

  private initForm(): void {
    this.brandForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      is_active: [true]
    });
  }

  private loadBrand(id: string): void {
    this.isLoading.set(true);
    this.productsService.getBrand(id).subscribe({
      next: (brand) => {
        this.brand.set(brand);

        // Populate form with brand data
        this.brandForm.patchValue({
          name: brand.name,
          description: brand.description || '',
          is_active: brand.is_active
        });

        // Set image preview if available
        if (brand.logo) {
          this.imagePreview.set(brand.logo);
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading brand:', error);
        this.toastService.error('Failed to load brand details');
        this.isLoading.set(false);
        this.router.navigate(['/products/brands']);
      }
    });
  }

  protected onHandleSaveBrandInformation(): void {
    if (this.brandForm.invalid) {
      // Mark form controls as touched to trigger validation messages
      Object.keys(this.brandForm.controls).forEach(key => {
        this.brandForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);

    // Prepare form data for API
    const formData = new FormData();
    const formValues = this.brandForm.value;

    // Add form fields to FormData
    Object.keys(formValues).forEach(key => {
      formData.append(key, formValues[key]);
    });

    // Add image if selected
    if (this.selectedImage) {
      formData.append('logo', this.selectedImage);
    }

    // Save brand based on mode (create or edit)
    const saveObservable = this.isEditMode() && this.brand()
      // @ts-ignore
      ? this.productsService.updateBrand(this.brand()!.id, formData)
      : this.productsService.handleCreateBrandWithInformation(formData);

    saveObservable.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.success(
          this.isEditMode() ? 'Brand updated successfully' : 'Brand created successfully'
        );
        this.router.navigate(['/products/brands']);
      },
      error: (error) => {
        console.error('Error saving brand:', error);
        this.isSaving.set(false);
        this.toastService.error(
          this.isEditMode() ? 'Failed to update brand' : 'Failed to create brand'
        );
      }
    });
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.selectedImage = file;

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected removeImage(): void {
    this.selectedImage = null;
    this.imagePreview.set(null);

    // Reset file input
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
