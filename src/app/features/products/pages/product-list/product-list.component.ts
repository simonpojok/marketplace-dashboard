import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Product, Category, Brand} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: 'product-list.component.html',
  styles: []
})
export class ProductListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected products = signal<Product[]>([]);
  protected totalProducts = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected searchTerm = signal('');
  protected selectedCategory = signal('');
  protected selectedBrand = signal('');
  protected filterInStock = signal(false);
  protected filterOnSale = signal(false);
  protected filterFeatured = signal(false);
  protected sortBy = signal('created_at');
  protected sortOrder = signal('desc');

  // Category and brand options for filters
  protected categories = signal<Category[]>([]);
  protected brands = signal<Brand[]>([]);

  // For use in template
  protected readonly Math = Math;

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  private loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private loadBrands(): void {
    this.productsService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  protected loadProducts(page: number = 1): void {
    this.isLoading.set(true);

    const params = {
      page: page.toString(),
      page_size: this.pageSize().toString(),
      search: this.searchTerm(),
      category: this.selectedCategory(),
      brand: this.selectedBrand(),
      in_stock: this.filterInStock() ? 'true' : null,
      on_sale: this.filterOnSale() ? 'true' : null,
      is_featured: this.filterFeatured() ? 'true' : null,
      ordering: this.getSortString()
    };

    this.productsService.getProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.results);
        this.totalProducts.set(response.count);
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error('Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  protected getSortString(): string {
    return this.sortOrder() === 'desc' ? `-${this.sortBy()}` : this.sortBy();
  }

  protected onSearch(): void {
    this.loadProducts(1);
  }

  protected onFilter(): void {
    this.loadProducts(1);
  }

  protected onSort(field: string): void {
    if (this.sortBy() === field) {
      // Toggle sort order if same field is clicked
      this.sortOrder.update(value => value === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for new sort field
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.loadProducts(1);
  }

  protected onPageChange(page: number): void {
    this.loadProducts(page);
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.selectedBrand.set('');
    this.filterInStock.set(false);
    this.filterOnSale.set(false);
    this.filterFeatured.set(false);
    this.sortBy.set('created_at');
    this.sortOrder.set('desc');
    this.loadProducts(1);
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected deleteProduct(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.deleteProduct(id).subscribe({
        next: () => {
          this.toastService.success('Product deleted successfully');
          this.loadProducts(this.currentPage());
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.toastService.error('Failed to delete product');
        }
      });
    }
  }

  protected getCategoryName(categoryId: string): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  protected getBrandName(brandId: string): string {
    const brand = this.brands().find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  }

  protected getPrimaryImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary);
      return primaryImage ? primaryImage.image : product.images[0].image;
    }
    return 'assets/images/placeholder-product.jpg';
  }

  public handSortProducts() {
    this.sortOrder.update(value => value === 'asc' ? 'desc' : 'asc');
    this.onFilter();
  }
}
