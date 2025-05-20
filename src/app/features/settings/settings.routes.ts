import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/settings-dashboard/settings-dashboard.component')
      .then(m => m.SettingsDashboardComponent),
    title: 'Settings'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile-settings/profile-settings.component')
      .then(m => m.ProfileSettingsComponent),
    title: 'Profile Settings'
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account-settings/account-settings.component')
      .then(m => m.AccountSettingsComponent),
    title: 'Account Settings'
  },
  {
    path: 'password',
    loadComponent: () => import('./pages/password-settings/password-settings.component')
      .then(m => m.PasswordSettingsComponent),
    title: 'Change Password'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notification-settings/notification-settings.component')
      .then(m => m.NotificationSettingsComponent),
    title: 'Notification Settings'
  },
  {
    path: 'appearance',
    loadComponent: () => import('./pages/appearance-settings/appearance-settings.component')
      .then(m => m.AppearanceSettingsComponent),
    title: 'Appearance Settings'
  },
  {
    path: 'store',
    loadComponent: () => import('./pages/store-settings/store-settings.component')
      .then(m => m.StoreSettingsComponent),
    title: 'Store Settings'
  }
];
