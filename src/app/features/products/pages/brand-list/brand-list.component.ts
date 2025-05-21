import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Brand } from '../../models/product.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './brand-list.component.html',
  styles: []
})
export class BrandListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected brands = signal<Brand[]>([]);
  protected searchTerm = signal('');
  protected showCreateModal = signal(false);
  protected showEditModal = signal(false);
  protected showDeleteModal = signal(false);
  protected isSubmitting = signal(false);
  protected selectedBrand = signal<Brand | null>(null);

  // Form for creating/editing brands
  protected brandForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    is_active: [true]
  });

  ngOnInit(): void {
    this.loadBrands();
  }

  protected loadBrands(): void {
    this.isLoading.set(true);
    this.productsService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.toastService.error('Failed to load brands');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    if (this.searchTerm()) {
      this.isLoading.set(true);
      this.productsService.searchBrands(this.searchTerm()).subscribe({
        next: (brands) => {
          this.brands.set(brands);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error searching brands:', error);
          this.toastService.error('Failed to search brands');
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadBrands();
    }
  }

  protected openCreateModal(): void {
    this.brandForm.reset({ is_active: true });
    this.showCreateModal.set(true);
  }

  protected openEditModal(brand: Brand): void {
    this.selectedBrand.set(brand);
    this.brandForm.patchValue({
      name: brand.name,
      description: brand.description || '',
      is_active: brand.is_active
    });
    this.showEditModal.set(true);
  }

  protected openDeleteModal(brand: Brand): void {
    this.selectedBrand.set(brand);
    this.showDeleteModal.set(true);
  }

  protected closeModals(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedBrand.set(null);
    this.brandForm.reset();
  }

  protected createBrand(): void {
    if (this.brandForm.invalid) {
      // Mark form controls as touched to trigger validation messages
      Object.keys(this.brandForm.controls).forEach(key => {
        const control = this.brandForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    this.productsService.createBrand(this.brandForm.value).subscribe({
      next: () => {
        this.toastService.success('Brand created successfully');
        this.loadBrands();
        this.closeModals();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error creating brand:', error);
        this.toastService.error('Failed to create brand');
        this.isSubmitting.set(false);
      }
    });
  }

  protected updateBrand(): void {
    if (this.brandForm.invalid || !this.selectedBrand()) {
      return;
    }

    this.isSubmitting.set(true);

    this.productsService.updateBrand(this.selectedBrand()!.id, this.brandForm.value).subscribe({
      next: () => {
        this.toastService.success('Brand updated successfully');
        this.loadBrands();
        this.closeModals();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error updating brand:', error);
        this.toastService.error('Failed to update brand');
        this.isSubmitting.set(false);
      }
    });
  }

  protected deleteBrand(): void {
    if (!this.selectedBrand()) {
      return;
    }

    this.isSubmitting.set(true);

    this.productsService.deleteBrand(this.selectedBrand()!.id).subscribe({
      next: () => {
        this.toastService.success('Brand deleted successfully');
        this.loadBrands();
        this.closeModals();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Error deleting brand:', error);
        this.toastService.error('Failed to delete brand');
        this.isSubmitting.set(false);
      }
    });
  }

  protected getActiveBrandsCount(): number {
    return this.brands().filter(brand => brand.is_active).length;
  }
}
