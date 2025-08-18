import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() collapsed = false;

  protected menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Customers',
      icon: 'users',
      route: '/customers'
    },
    {
      label: 'Products',
      icon: 'package',
      children: [
        {
          label: 'All Products',
          route: '/products/list',
          icon: 'list'
        },
        {
          label: 'Add Product',
          route: '/products/create',
          icon: 'plus'
        },
        {
          label: 'Categories',
          route: '/products/categories',
          icon: 'folder'
        },
        {
          label: 'Brands',
          route: '/products/brands',
          icon: 'tag'
        }
      ]
    },
    {
      label: 'Orders',
      icon: 'shopping-bag',
      children: [
        {
          label: 'All Orders',
          route: '/orders/list',
          icon: 'list'
        },
        {
          label: 'Pending',
          route: '/orders/pending',
          icon: 'clock'
        },
        {
          label: 'Processing',
          route: '/orders/processing',
          icon: 'refresh-cw'
        },
        {
          label: 'Shipped',
          route: '/orders/shipped',
          icon: 'truck'
        },
        {
          label: 'Delivered',
          route: '/orders/delivered',
          icon: 'check-circle'
        },
        {
          label: 'Cancelled',
          route: '/orders/cancelled',
          icon: 'x-circle'
        }
      ]
    },
    {
      label: 'Promotions',
      icon: 'tag',
      children: [
        {
          label: 'Campaigns',
          route: '/promotions/campaigns',
          icon: 'pie-chart'
        },
        {
          label: 'Promotions',
          route: '/promotions/promotions',
          icon: 'tag'
        },
        {
          label: 'Coupons',
          route: '/promotions/coupons',
          icon: 'ticket'
        },
        {
          label: 'Usage Analytics',
          route: '/promotions/usage',
          icon: 'analytics'
        }
      ]
    },
    {
      label: 'Admin Users',
      icon: 'user-check',
      children: [
        {
          label: 'All Users',
          route: '/admin-users',
          icon: 'users'
        },
        {
          label: 'Create User',
          route: '/admin-users/create',
          icon: 'user-plus'
        }
      ]
    },
    {
      label: 'Analytics',
      icon: 'analytics',
      route: '/analytics'
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings'
    }
  ];

  protected toggleSubMenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  protected getIconPath(iconName: string): string {
    return `/assets/icons/sidebar/${iconName}.svg`;
  }
}
