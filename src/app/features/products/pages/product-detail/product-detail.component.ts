import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {ProductsService} from '../../services/products.service';
import {Product} from '../../models/product.model';
import {ProductVariation, VARIATION_ATTRIBUTES} from '../../models/product-variation.model';
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

  protected hasMoreImages(): boolean {
    if (this.product()?.images) {
      return (this.product()?.images?.length || 0) > 0;
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

  // Variation helper methods
  protected calculateVariationPrice(basePrice: number, priceAdjustment: number): number {
    return basePrice + (priceAdjustment || 0);
  }

  protected getVariationDisplayName(variation: ProductVariation): string {
    const attributeStrings = Object.entries(variation.attributes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => `${this.getAttributeLabel(key)}: ${this.formatAttributeValue(value)}`);

    return attributeStrings.length > 0 ? attributeStrings.join(', ') : 'No attributes';
  }

  protected getAttributeLabel(key: string): string {
    return VARIATION_ATTRIBUTES[key]?.label || key;
  }

  protected formatAttributeValue(value: string): string {
    // If it's a custom value, show it more cleanly
    if (value.startsWith('Custom:')) {
      const customValue = value.replace('Custom:', '').trim();
      return customValue || 'Custom';
    }
    return value;
  }

  protected getVariationAttributes(variation: ProductVariation): Array<{label: string, value: string}> {
    return Object.entries(variation.attributes)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => ({
        label: this.getAttributeLabel(key),
        value: this.formatAttributeValue(value)
      }));
  }

  protected getVariationStockStatusClass(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'text-red-600 dark:text-red-400';
    } else if (stockQuantity < 10) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  }

  protected getColorValue(colorString: string): string | null {
    // Check if the attribute contains a color hex code
    const hexMatch = colorString.match(/#[0-9A-Fa-f]{6}/);
    if (hexMatch) {
      return hexMatch[0];
    }

    // Simple color name to hex mapping for common colors
    const colorMap: { [key: string]: string } = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#008000',
      'black': '#000000',
      'white': '#ffffff',
      'yellow': '#ffff00',
      'pink': '#ffc0cb',
      'purple': '#800080',
      'orange': '#ffa500',
      'gray': '#808080',
      'grey': '#808080'
    };

    const lowerColor = colorString.toLowerCase();
    for (const [colorName, hexValue] of Object.entries(colorMap)) {
      if (lowerColor.includes(colorName)) {
        return hexValue;
      }
    }

    return null;
  }

  protected hasColorAttribute(variation: ProductVariation): boolean {
    return 'color' in variation.attributes && variation.attributes['color'].trim() !== '';
  }
}
