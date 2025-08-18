import {Component, OnInit, OnDestroy, inject, signal, model, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Router, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Subject, Subscription, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {ProductsService} from '../../services/products.service';
import {Product, Category, Brand} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';
import {ProductCardComponent} from './components/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: 'product-list.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected products = signal<Product[]>([]);
  protected totalProducts = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected searchTerm = model('');
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

  // Search debouncing
  private searchSubject = new Subject<string>();

  // Constants
  private static readonly SEARCH_DEBOUNCE_TIME = 300;
  
  // Component state tracking
  private categoriesLoaded = signal(false);
  private brandsLoaded = signal(false);

  // For use in template
  protected readonly Math = Math;

  // TrackBy functions for performance
  protected trackByProductId = (index: number, product: Product): string => product.id;
  protected trackByCategoryId = (index: number, category: Category): string => category.id;
  protected trackByBrandId = (index: number, brand: Brand): string => brand.id;

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.setupSearchDebouncing();
    this.setupQueryParamsSubscription();
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
    this.searchSubject.complete();
  }

  private loadCategories(): void {
    this.productsService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.categoriesLoaded.set(true);
          this.checkIfReadyToLoadProducts();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.toastService.error('Failed to load categories');
          this.categoriesLoaded.set(true); // Still mark as loaded to avoid blocking
          this.checkIfReadyToLoadProducts();
        }
      });
  }

  private loadBrands(): void {
    this.productsService.getBrands()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (brands) => {
          this.brands.set(brands);
          this.brandsLoaded.set(true);
          this.checkIfReadyToLoadProducts();
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          this.toastService.error('Failed to load brands');
          this.brandsLoaded.set(true); // Still mark as loaded to avoid blocking
          this.checkIfReadyToLoadProducts();
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
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onFilter(): void {
    this.updateUrlParams();
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
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrlParams();
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
    this.currentPage.set(1);
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected deleteProduct(id: string): void {
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

  protected toggleSortOrder() {
    this.sortOrder.update(value => value === 'asc' ? 'desc' : 'asc');
    this.updateUrlParams();
    this.loadProducts(1);
  }

  private setupSearchDebouncing(): void {
    this.searchSubject.pipe(
      debounceTime(ProductListComponent.SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(searchTerm => {
      this.searchTerm.set(searchTerm);
      this.updateUrlParams();
      this.loadProducts(1);
    });
  }

  private setupQueryParamsSubscription(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        // Read parameters from URL and update component state with validation
        this.searchTerm.set(params['search'] || '');
        this.selectedCategory.set(params['category'] || '');
        this.selectedBrand.set(params['brand'] || '');
        this.filterInStock.set(params['in_stock'] === 'true');
        this.filterOnSale.set(params['on_sale'] === 'true');
        this.filterFeatured.set(params['is_featured'] === 'true');
        this.sortBy.set(params['sort_by'] || 'created_at');
        this.sortOrder.set(params['sort_order'] || 'desc');
        
        // Validate and set page number
        const pageParam = params['page'];
        const page = pageParam ? Math.max(1, parseInt(pageParam) || 1) : 1;
        this.currentPage.set(page);
        
        // Only load products if categories and brands are loaded
        this.checkIfReadyToLoadProducts();
      });
  }

  private checkIfReadyToLoadProducts(): void {
    if (this.categoriesLoaded() && this.brandsLoaded()) {
      this.loadProducts(this.currentPage());
    }
  }

  private updateUrlParams(): void {
    const queryParams: Record<string, string> = {};
    
    // Only add parameters that have values
    if (this.searchTerm()) queryParams.search = this.searchTerm();
    if (this.selectedCategory()) queryParams.category = this.selectedCategory();
    if (this.selectedBrand()) queryParams.brand = this.selectedBrand();
    if (this.filterInStock()) queryParams.in_stock = 'true';
    if (this.filterOnSale()) queryParams.on_sale = 'true';
    if (this.filterFeatured()) queryParams.is_featured = 'true';
    if (this.sortBy() !== 'created_at') queryParams.sort_by = this.sortBy();
    if (this.sortOrder() !== 'desc') queryParams.sort_order = this.sortOrder();
    if (this.currentPage() > 1) queryParams.page = this.currentPage().toString();
    
    // Update URL without triggering navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onBrandChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedBrand.set(target.value);
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onSortByChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value);
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onInStockChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterInStock.set(target.checked);
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onOnSaleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterOnSale.set(target.checked);
    this.updateUrlParams();
    this.loadProducts(1);
  }

  protected onFeaturedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterFeatured.set(target.checked);
    this.updateUrlParams();
    this.loadProducts(1);
  }
}
