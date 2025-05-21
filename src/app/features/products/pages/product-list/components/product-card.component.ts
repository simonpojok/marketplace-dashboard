import {Component, inject, input, Output, output, signal} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Brand, Category, Product} from '../../../models/product.model';
import {ProductsService} from '../../../services/products.service';
import {ToastService} from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NgClass,
  ]
})
export class ProductCardComponent {
  product = input.required<Product>()
  categories = input.required<Array<Category>>()
  brands = input.required<Array<Brand>>()
  onDeleteProduct = output<Product>();

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

  protected getCategoryName(categoryId: string): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  protected getBrandName(brandId: string | undefined): string {
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

  protected deleteProduct(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.onDeleteProduct.emit(this.product())
  }
}
