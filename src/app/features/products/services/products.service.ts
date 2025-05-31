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
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/admin`;

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

  handleCreateProduct(product: FormData): Observable<Product> {
    console.log(product);
    return this.http.post<Product>(`${this.apiUrl}/products/`, product);
  }

  handleUpdateProduct(id: string, product: FormData): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/products/${id}/`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}/`);
  }

  // Feature Product Collections
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured/`);
  }

  getOnSaleProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/on_sale/`);
  }

  getNewestProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/newest/`);
  }

  // Categories
  getCategories(params?: any): Observable<Category[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<Category[]>(`${this.apiUrl}/categories/`, {params: httpParams});
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}/`);
  }

  handleCreateCategoryWithInformation(category: FormData): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories/`, category);
  }

  updateCategory(id: string, category: FormData): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}/`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}/`);
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

  searchCategories(query: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/search/`, {params: {q: query}});
  }

  // Brands
  getBrands(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/brands/`, {params: httpParams});
  }

  getBrand(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/brands/${id}/`);
  }

  handleCreateBrandWithInformation(brand: FormData): Observable<Brand> {
    console.log(brand)
    return this.http.post<Brand>(`${this.apiUrl}/brands/`, brand);
  }

  updateBrand(id: string, brand: FormData): Observable<Brand> {
    return this.http.patch<Brand>(`${this.apiUrl}/brands/${id}/`, brand);
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/brands/${id}/`);
  }

  searchBrands(query: string): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands/search/`, {params: {q: query}});
  }

  // Search
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search/`, {params: {q: query}});
  }

  getCategoryChildren(parentId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/admin/categories/${parentId}/children/`);
  }
}
