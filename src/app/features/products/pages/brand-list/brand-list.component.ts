import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Brand } from '../../models/product.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brand-list.component.html',
  styles: []
})
export class BrandListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected brands = signal<Brand[]>([]);
  protected searchTerm = signal('');
  protected selectedStatus = signal<string | null>(null);
  protected sortBy = signal('name');
  protected sortOrder = signal('asc');
  protected totalBrands = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(10);

  ngOnInit(): void {
    this.loadBrands();
  }

  protected loadBrands(page: number = 1): void {
    this.isLoading.set(true);

    const params = {
      page,
      page_size: this.pageSize(),
      search: this.searchTerm() || null,
      is_active: this.selectedStatus(),
      ordering: this.getSortString()
    };

    this.productsService.getBrands(params).subscribe({
      next: (response) => {
        // @ts-ignore
        this.brands.set(response.results || response); // Handle both paginated and non-paginated responses

        // If paginated response, update total count
        if ('count' in response) {
          // @ts-ignore
          this.totalBrands.set(response.count);
        } else {
          this.totalBrands.set(response.length);
        }

        this.currentPage.set(page);
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
    this.loadBrands(1);
  }

  protected onFilter(): void {
    this.loadBrands(1);
  }

  protected onSort(field: string): void {
    if (this.sortBy() === field) {
      // Toggle sort order if same field is clicked
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new sort field
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.loadBrands(1);
  }

  protected getSortString(): string {
    return this.sortOrder() === 'desc' ? `-${this.sortBy()}` : this.sortBy();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.sortBy.set('name');
    this.sortOrder.set('asc');
    this.loadBrands(1);
  }

  protected onPageChange(page: number): void {
    this.loadBrands(page);
  }

  protected deleteBrand(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this brand?')) {
      this.productsService.deleteBrand(id).subscribe({
        next: () => {
          this.toastService.success('Brand deleted successfully');
          this.loadBrands(this.currentPage());
        },
        error: (error) => {
          console.error('Error deleting brand:', error);
          this.toastService.error('Failed to delete brand');
        }
      });
    }
  }

  protected readonly Math = Math;
}
