import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    title: 'All Products'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/product-form/product-form.component')
      .then(m => m.ProductFormComponent),
    title: 'Add New Product'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/product-form/product-form.component')
      .then(m => m.ProductFormComponent),
    title: 'Edit Product'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent),
    title: 'Product Details'
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/category-list/category-list.component')
      .then(m => m.CategoryListComponent),
    title: 'Product Categories'
  },
  {
    path: 'brands',
    loadComponent: () => import('./pages/brand-list/brand-list.component')
      .then(m => m.BrandListComponent),
    title: 'Product Brands'
  }
];
