import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Category} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styles: []
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected isEditMode = signal(false);
  protected categoryId = signal<string | null>(null);
  protected parentCategories = signal<Category[]>([]);
  protected selectedImage = signal<string | null>(null);
  protected imagePreview = signal<string | null>(null);

  // Form
  protected categoryForm!: FormGroup;

  // File input
  protected imageFile: File | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadParentCategories();

    // Check if we are in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoryId.set(id);
      this.isEditMode.set(true);
      this.loadCategory(id);
    } else {
      this.isLoading.set(false);
    }
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: [''],
      parent: [''],
      description: [''],
      is_active: [true],
      display_order: [0]
    });
  }

  private loadParentCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        // Filter out the current category (if in edit mode) to prevent self-reference
        const filtered = this.isEditMode() && this.categoryId()
          ? categories.filter(cat => cat.id !== this.categoryId())
          : categories;

        this.parentCategories.set(filtered);
      },
      error: (error) => {
        console.error('Error loading parent categories:', error);
        this.toastService.error('Failed to load parent categories');
      }
    });
  }

  private loadCategory(id: string): void {
    this.productsService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          slug: category.slug,
          parent: category.parent || '',
          description: category.description || '',
          is_active: category.is_active,
          display_order: category.display_order
        });

        if (category.image) {
          this.selectedImage.set(category.image);
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.toastService.error('Failed to load category details');
        this.isLoading.set(false);
        this.router.navigate(['/products/categories']);
      }
    });
  }

  protected onSubmit(): void {
    if (this.categoryForm.invalid) {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.categoryForm.controls).forEach(key => {
        const control = this.categoryForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);

    // Create FormData for the API request
    const formData = new FormData();
    const formValue = this.categoryForm.value;

    // Append form values to FormData
    formData.append('name', formValue.name);

    // Only include slug if provided
    if (formValue.slug) {
      formData.append('slug', formValue.slug);
    }

    // Only include parent if provided
    if (formValue.parent) {
      formData.append('parent', formValue.parent);
    }

    if (formValue.description) {
      formData.append('description', formValue.description);
    }

    formData.append('is_active', formValue.is_active.toString());
    formData.append('display_order', formValue.display_order.toString());

    // Append image if a new file was selected
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    if (this.isEditMode()) {
      this.updateCategory(formData);
    } else {
      this.handleCreateCategory(formData);
    }
  }

  private handleCreateCategory(formData: FormData): void {
    this.productsService.handleCreateCategoryWithInformation(formData).subscribe({
      next: (category) => {
        this.isSaving.set(false);
        this.toastService.success('Category created successfully');
        this.router.navigate(['/products/categories']).then(console.log);
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.toastService.error('Failed to create category');
        this.isSaving.set(false);
      }
    });
  }

  private updateCategory(formData: FormData): void {
    if (!this.categoryId()) return;

    // @ts-ignore
    this.productsService.updateCategory(this.categoryId()!, formData).subscribe({
      next: (category) => {
        this.isSaving.set(false);
        this.toastService.success('Category updated successfully');
        this.router.navigate(['/products/categories']);
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.toastService.error('Failed to update category');
        this.isSaving.set(false);
      }
    });
  }

  protected onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];

      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  protected removeImage(): void {
    this.imageFile = null;
    this.imagePreview.set(null);
    this.selectedImage.set(null);
  }

  protected generateSlug(): void {
    const name = this.categoryForm.get('name')?.value;
    if (name) {
      // Simple slug generator - lowercase, replace spaces with hyphens, remove special chars
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      this.categoryForm.patchValue({slug});
    }
  }

  protected canDeactivate(): boolean {
    return !this.categoryForm.dirty || this.isSaving();
  }
}
