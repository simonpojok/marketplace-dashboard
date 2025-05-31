import { Routes } from '@angular/router';

export const PROMOTIONS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'campaigns',
    pathMatch: 'full'
  },
  {
    path: 'campaigns',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/campaign-list/campaign-list.component')
          .then(m => m.CampaignListComponent),
        title: 'Campaigns'
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/campaign-create/campaign-create.component')
          .then(m => m.CampaignCreateComponent),
        title: 'Create Campaign'
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/campaign-detail/campaign-detail.component')
          .then(m => m.CampaignDetailComponent),
        title: 'Campaign Details'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/campaign-edit/campaign-edit.component')
          .then(m => m.CampaignEditComponent),
        title: 'Edit Campaign'
      },
      {
        path: ':id/analytics',
        loadComponent: () => import('./pages/campaign-analytics/campaign-analytics.component')
          .then(m => m.CampaignAnalyticsComponent),
        title: 'Campaign Analytics'
      }
    ]
  },
  {
    path: 'promotions',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/promotion-list/promotion-list.component')
          .then(m => m.PromotionListComponent),
        title: 'Promotions'
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/promotion-create/promotion-create.component')
          .then(m => m.PromotionCreateComponent),
        title: 'Create Promotion'
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/promotion-detail/promotion-detail.component')
          .then(m => m.PromotionDetailComponent),
        title: 'Promotion Details'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/promotion-edit/promotion-edit.component')
          .then(m => m.PromotionEditComponent),
        title: 'Edit Promotion'
      }
    ]
  },
  {
    path: 'coupons',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/coupon-list/coupon-list.component')
          .then(m => m.CouponListComponent),
        title: 'Coupons'
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/coupon-create/coupon-create.component')
          .then(m => m.CouponCreateComponent),
        title: 'Create Coupon'
      },
      {
        path: 'bulk-create',
        loadComponent: () => import('./pages/coupon-bulk-create/coupon-bulk-create.component')
          .then(m => m.CouponBulkCreateComponent),
        title: 'Bulk Create Coupons'
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/coupon-detail/coupon-detail.component')
          .then(m => m.CouponDetailComponent),
        title: 'Coupon Details'
      }
    ]
  },
  {
    path: 'usage',
    loadComponent: () => import('./pages/promotion-usage/promotion-usage.component')
      .then(m => m.PromotionUsageComponent),
    title: 'Promotion Usage'
  }
];
