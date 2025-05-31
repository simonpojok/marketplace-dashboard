import {Routes} from '@angular/router';
import {authGuard} from './core/auth/guards/auth.guard';
import {nonAuthGuard} from './core/auth/guards/non-auth.guard';
import {ADMIN_ROUTES} from './features/admin-users/admin-users-routing';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [nonAuthGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        title: 'Dashboard'
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes')
          .then(m => m.PRODUCTS_ROUTES),
        title: 'Products Management'
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes')
          .then(m => m.ORDERS_ROUTES),
        title: 'Orders Management'
      },
      {
        path: 'customers',
        loadChildren: () => import('./features/customers/customers.routes')
          .then(m => m.CUSTOMERS_ROUTES),
        title: 'Customers Management'
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes')
          .then(m => m.SETTINGS_ROUTES),
        title: 'Settings'
      },
      {
        path: 'promotions',
        loadChildren: () => import('./features/promotions/promotions.routes')
          .then(m => m.PROMOTIONS_ROUTES),
        title: 'Promotions'
      },
      {
        path: 'admin-users',
        loadChildren: () => import('./features/admin-users/admin-users-routing').then(m => m.ADMIN_ROUTES),
        data: {
          title: 'Admin Users Management',
          requiresStaff: true,
          breadcrumb: 'Admin Users'
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
