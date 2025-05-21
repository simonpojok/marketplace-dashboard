import {Routes} from '@angular/router';

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
    title: 'Products'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/product-form/product-form.component')
      .then(m => m.ProductFormComponent),
    title: 'Create Product'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/product-form/product-form.component')
      .then(m => m.ProductFormComponent),
    title: 'Edit Product'
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent),
    title: 'Product Details'
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/category-list/category-list.component')
      .then(m => m.CategoryListComponent),
    title: 'Categories'
  },
  {
    path: 'categories/create',
    loadComponent: () => import('./pages/category-form/category-form.component')
      .then(m => m.CategoryFormComponent),
    title: 'Create Category'
  },
  {
    path: 'categories/edit/:id',
    loadComponent: () => import('./pages/category-form/category-form.component')
      .then(m => m.CategoryFormComponent),
    title: 'Edit Category'
  },
  {
    path: 'brands',
    loadComponent: () => import('./pages/brand-list/brand-list.component')
      .then(m => m.BrandListComponent),
    title: 'Brands'
  },
  {
    path: 'brands/create',
    loadComponent: () => import('./pages/brand-form/brand-form.component')
      .then(m => m.BrandFormComponent),
    title: 'Create Brand'
  },
  {
    path: 'brands/edit/:id',
    loadComponent: () => import('./pages/brand-form/brand-form.component')
      .then(m => m.BrandFormComponent),
    title: 'Edit Brand'
  }
];
