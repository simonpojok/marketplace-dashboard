import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Product, Category, Brand, ProductListResponse} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/products`;

  // Products
  getProducts(params?: any): Observable<ProductListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<ProductListResponse>(`${this.apiUrl}/products/`, {params: httpParams});
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}/`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}/`);
  }

  // Featured Products
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured/`);
  }

  // On Sale Products
  getOnSaleProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/on_sale/`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}/`);
  }

  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/root/`);
  }

  getCategoryProducts(id: string, includeChildren: boolean = false): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/categories/${id}/products/`,
      {params: {include_children: includeChildren.toString()}}
    );
  }

  // Brands
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands/`);
  }

  getBrand(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/brands/${id}/`);
  }

  // Search
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search/`, {params: {q: query}});
  }
}
