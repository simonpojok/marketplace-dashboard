import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {ProductsService} from '../../services/products.service';
import {Product} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styles: []
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state
  protected isLoading = signal(true);
  protected isDeletingProduct = signal(false);
  protected product = signal<Product | null>(null);
  protected selectedImageIndex = signal(0);

  ngOnInit(): void {
    // Get the product ID from the route
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.router.navigate(['/products']);
    }
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);

        // Find the primary image and set it as selected by default
        if (product.images && product.images.length > 0) {
          const primaryIndex = product.images.findIndex(img => img.is_primary);
          this.selectedImageIndex.set(primaryIndex !== -1 ? primaryIndex : 0);
        }

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

  protected setSelectedImage(index: number): void {
    this.selectedImageIndex.set(index);
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
      month: 'long',
      day: 'numeric'
    });
  }

  protected deleteProduct(): void {
    if (!this.product()) return;

    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.isDeletingProduct.set(true);

      this.productsService.deleteProduct(this.product()!.id).subscribe({
        next: () => {
          this.isDeletingProduct.set(false);
          this.toastService.success('Product deleted successfully');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.isDeletingProduct.set(false);
          console.error('Error deleting product:', error);
          this.toastService.error('Failed to delete product');
        }
      });
    }
  }

  protected hasDiscount(): boolean {
    return !!this.product()?.discount_price;
  }

  protected handMoreImages(): boolean {
    if (this.product()?.images) {
      // @ts-ignore
      return this.product()?.images.length > 0;
    }
    return false;
  }

  protected productImage(): string {
    return this.product()?.images[this.selectedImageIndex()]?.image ?? '';
  }

  protected getStockStatusClass(): string {
    const stockQty = this.product()?.stock_quantity || 0;

    if (stockQty === 0) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else if (stockQty < 10) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  }
}
