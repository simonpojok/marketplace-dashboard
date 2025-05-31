import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-white dark:bg-dark-bg-secondary border-r border-gray-200 dark:border-dark-border">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2">
          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
            </svg>
            Dashboard
          </a>

          <!-- Users -->
          <a
            routerLink="/users"
            routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </svg>
            Users
          </a>

          <!-- Products -->
          <a
            routerLink="/products"
            routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Products
          </a>

          <!-- Orders -->
          <a
            routerLink="/orders"
            routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2M9 5a2 2 0 012 2v11a2 2 0 01-2 2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 21V9a2 2 0 012-2h2a2 2 0 012 2v12M15 9l3 3m0 0l-3 3m3-3H9"/>
            </svg>
            Orders
          </a>

          <!-- Promotions (NEW) -->
          <div class="space-y-1">
            <a
              routerLink="/promotions"
              routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              Promotions
            </a>

            <!-- Promotions Submenu -->
            <div class="ml-6 space-y-1">
              <a
                routerLink="/promotions/campaigns"
                routerLinkActive="text-primary-600 dark:text-primary-400"
                class="flex items-center px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Campaigns
              </a>
              <a
                routerLink="/promotions/promotions"
                routerLinkActive="text-primary-600 dark:text-primary-400"
                class="flex items-center px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Promotions
              </a>
              <a
                routerLink="/promotions/coupons"
                routerLinkActive="text-primary-600 dark:text-primary-400"
                class="flex items-center px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Coupons
              </a>
              <a
                routerLink="/promotions/usage"
                routerLinkActive="text-primary-600 dark:text-primary-400"
                class="flex items-center px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Usage Analytics
              </a>
            </div>
          </div>

          <!-- Analytics -->
          <a
            routerLink="/analytics"
            routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Analytics
          </a>

          <!-- Settings -->
          <a
            routerLink="/settings"
            routerLinkActive="bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/50 dark:border-primary-400 dark:text-primary-300"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Settings
          </a>
        </nav>
      </div>
    </aside>
  `
})
export class SidebarComponent {
}
