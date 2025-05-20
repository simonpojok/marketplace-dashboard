import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/order-list/order-list.component')
      .then(m => m.OrderListComponent),
    title: 'All Orders'
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/order-form/order-form.component')
      .then(m => m.OrderFormComponent),
    title: 'Create Order'
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/order-detail/order-detail.component')
      .then(m => m.OrderDetailComponent),
    title: 'Order Details'
  },
  {
    path: 'pending',
    loadComponent: () => import('./pages/order-list/order-list.component')
      .then(m => m.OrderListComponent),
    data: { status: 'pending' },
    title: 'Pending Orders'
  },
  {
    path: 'processing',
    loadComponent: () => import('./pages/order-list/order-list.component')
      .then(m => m.OrderListComponent),
    data: { status: 'processing' },
    title: 'Processing Orders'
  },
  {
    path: 'shipped',
    loadComponent: () => import('./pages/order-list/order-list.component')
      .then(m => m.OrderListComponent),
    data: { status: 'shipped' },
    title: 'Shipped Orders'
  },
  {
    path: 'delivered',
    loadComponent: () => import('./pages/order-list/order-list.component')
      .then(m => m.OrderListComponent),
    data: { status: 'delivered' },
    title: 'Delivered Orders'
  },
  {
    path: 'cancelled',
    loadComponent: () => import('./pages/order-list/order-list.component')
      .then(m => m.OrderListComponent),
    data: { status: 'cancelled' },
    title: 'Cancelled Orders'
  }
];
