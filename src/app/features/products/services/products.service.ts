import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Product, Category, Brand, ProductListResponse, ProductImage, ProductVariation } from '../models/product.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/products`;

  // Products
  getProducts(params?: any): Observable<ProductListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/products/`, { params: httpParams }).pipe(
      catchError(error => {
        console.error('Error fetching products:', error);
        this.toastService.error('Failed to load products');
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}/`).pipe(
      catchError(error => {
        console.error(`Error fetching product ${id}:`, error);
        this.toastService.error('Failed to load product details');
        throw error;
      })
    );
  }

  createProduct(product: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, product).pipe(
      catchError(error => {
        console.error('Error creating product:', error);
        this.toastService.error('Failed to create product');
        throw error;
      })
    );
  }

  updateProduct(id: string, product: FormData): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/`, product).pipe(
      catchError(error => {
        console.error(`Error updating product ${id}:`, error);
        this.toastService.error('Failed to update product');
        throw error;
      })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}/`).pipe(
      catchError(error => {
        console.error(`Error deleting product ${id}:`, error);
        this.toastService.error('Failed to delete product');
        throw error;
      })
    );
  }

  // Featured Products
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured/`).pipe(
      catchError(error => {
        console.error('Error fetching featured products:', error);
        this.toastService.error('Failed to load featured products');
        return of([]);
      })
    );
  }

  // On Sale Products
  getOnSaleProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/on_sale/`).pipe(
      catchError(error => {
        console.error('Error fetching on sale products:', error);
        this.toastService.error('Failed to load on sale products');
        return of([]);
      })
    );
  }

  // Latest Products
  getNewestProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/newest/`).pipe(
      catchError(error => {
        console.error('Error fetching newest products:', error);
        this.toastService.error('Failed to load newest products');
        return of([]);
      })
    );
  }

  // Product Images
  addProductImage(productId: string, imageData: FormData): Observable<ProductImage> {
    return this.http.post<ProductImage>(`${this.apiUrl}/products/${productId}/images/`, imageData).pipe(
      catchError(error => {
        console.error(`Error adding image to product ${productId}:`, error);
        this.toastService.error('Failed to add product image');
        throw error;
      })
    );
  }

  updateProductImage(productId: string, imageId: string, imageData: FormData): Observable<ProductImage> {
    return this.http.patch<ProductImage>(`${this.apiUrl}/products/${productId}/images/${imageId}/`, imageData).pipe(
      catchError(error => {
        console.error(`Error updating image ${imageId} for product ${productId}:`, error);
        this.toastService.error('Failed to update product image');
        throw error;
      })
    );
  }

  deleteProductImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}/images/${imageId}/`).pipe(
      catchError(error => {
        console.error(`Error deleting image ${imageId} for product ${productId}:`, error);
        this.toastService.error('Failed to delete product image');
        throw error;
      })
    );
  }

  // Product Variations
  addProductVariation(productId: string, variation: any): Observable<ProductVariation> {
    return this.http.post<ProductVariation>(`${this.apiUrl}/products/${productId}/variations/`, variation).pipe(
      catchError(error => {
        console.error(`Error adding variation to product ${productId}:`, error);
        this.toastService.error('Failed to add product variation');
        throw error;
      })
    );
  }

  updateProductVariation(productId: string, variationId: string, variation: any): Observable<ProductVariation> {
    return this.http.patch<ProductVariation>(`${this.apiUrl}/products/${productId}/variations/${variationId}/`, variation).pipe(
      catchError(error => {
        console.error(`Error updating variation ${variationId} for product ${productId}:`, error);
        this.toastService.error('Failed to update product variation');
        throw error;
      })
    );
  }

  deleteProductVariation(productId: string, variationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}/variations/${variationId}/`).pipe(
      catchError(error => {
        console.error(`Error deleting variation ${variationId} for product ${productId}:`, error);
        this.toastService.error('Failed to delete product variation');
        throw error;
      })
    );
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        this.toastService.error('Failed to load categories');
        return of([]);
      })
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}/`).pipe(
      catchError(error => {
        console.error(`Error fetching category ${id}:`, error);
        this.toastService.error('Failed to load category details');
        throw error;
      })
    );
  }

  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/root/`).pipe(
      catchError(error => {
        console.error('Error fetching root categories:', error);
        this.toastService.error('Failed to load root categories');
        return of([]);
      })
    );
  }

  getCategoryProducts(id: string, includeChildren: boolean = false): Observable<Product[]> {
    const params = new HttpParams().set('include_children', includeChildren.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/categories/${id}/products/`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching products for category ${id}:`, error);
        this.toastService.error('Failed to load category products');
        return of([]);
      })
    );
  }

  createCategory(category: FormData): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories/`, category).pipe(
      catchError(error => {
        console.error('Error creating category:', error);
        this.toastService.error('Failed to create category');
        throw error;
      })
    );
  }

  updateCategory(id: string, category: FormData): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}/`, category).pipe(
      catchError(error => {
        console.error(`Error updating category ${id}:`, error);
        this.toastService.error('Failed to update category');
        throw error;
      })
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}/`).pipe(
      catchError(error => {
        console.error(`Error deleting category ${id}:`, error);
        this.toastService.error('Failed to delete category');
        throw error;
      })
    );
  }

  // Brands
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands/`).pipe(
      catchError(error => {
        console.error('Error fetching brands:', error);
        this.toastService.error('Failed to load brands');
        return of([]);
      })
    );
  }

  getBrand(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/brands/${id}/`).pipe(
      catchError(error => {
        console.error(`Error fetching brand ${id}:`, error);
        this.toastService.error('Failed to load brand details');
        throw error;
      })
    );
  }

  createBrand(brand: FormData): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/brands/`, brand).pipe(
      catchError(error => {
        console.error('Error creating brand:', error);
        this.toastService.error('Failed to create brand');
        throw error;
      })
    );
  }

  updateBrand(id: string, brand: FormData): Observable<Brand> {
    return this.http.patch<Brand>(`${this.apiUrl}/brands/${id}/`, brand).pipe(
      catchError(error => {
        console.error(`Error updating brand ${id}:`, error);
        this.toastService.error('Failed to update brand');
        throw error;
      })
    );
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/brands/${id}/`).pipe(
      catchError(error => {
        console.error(`Error deleting brand ${id}:`, error);
        this.toastService.error('Failed to delete brand');
        throw error;
      })
    );
  }

  // Search
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search/`, { params: { q: query } }).pipe(
      catchError(error => {
        console.error(`Error searching products with query "${query}":`, error);
        this.toastService.error('Failed to search products');
        return of([]);
      })
    );
  }

  // Helper method to build FormData for product
  buildProductFormData(product: Partial<Product>, images?: File[]): FormData {
    const formData = new FormData();

    // Add product data
    if (product.name) formData.append('name', product.name);
    if (product.category) formData.append('category', product.category);
    if (product.brand) formData.append('brand', product.brand);
    if (product.description) formData.append('description', product.description);
    if (product.price !== undefined) formData.append('price', product.price.toString());
    // if (product.discount_price !== undefined) formData.append('discount_price', product.discount_price.toString());
    if (product.stock_quantity !== undefined) formData.append('stock_quantity', product.stock_quantity.toString());
    if (product.has_variations !== undefined) formData.append('has_variations', product.has_variations.toString());
    if (product.is_active !== undefined) formData.append('is_active', product.is_active.toString());
    if (product.is_featured !== undefined) formData.append('is_featured', product.is_featured.toString());

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    return formData;
  }
}
