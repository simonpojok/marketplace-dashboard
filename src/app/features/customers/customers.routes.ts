import { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/customer-list/customer-list.component')
      .then(m => m.CustomerListComponent),
    title: 'Customers'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/customer-form/customer-form.component')
      .then(m => m.CustomerFormComponent),
    title: 'Add Customer'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/customer-detail/customer-detail.component')
      .then(m => m.CustomerDetailComponent),
    title: 'Customer Details'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/customer-form/customer-form.component')
      .then(m => m.CustomerFormComponent),
    title: 'Edit Customer'
  }
];
