import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet, RouterModule} from '@angular/router';

@Component({
  selector: 'app-promotions-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <!-- Quick Navigation Bar -->
      <div class="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex space-x-8">
              <a
                routerLink="/promotions/campaigns"
                routerLinkActive="border-primary-500 text-primary-600 dark:text-primary-400"
                class="border-b-2 border-transparent px-1 pt-1 pb-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
                </svg>
                Campaigns
              </a>
              <a
                routerLink="/promotions/promotions"
                routerLinkActive="border-primary-500 text-primary-600 dark:text-primary-400"
                class="border-b-2 border-transparent px-1 pt-1 pb-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                Promotions
              </a>
              <a
                routerLink="/promotions/coupons"
                routerLinkActive="border-primary-500 text-primary-600 dark:text-primary-400"
                class="border-b-2 border-transparent px-1 pt-1 pb-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                </svg>
                Coupons
              </a>
              <a
                routerLink="/promotions/usage"
                routerLinkActive="border-primary-500 text-primary-600 dark:text-primary-400"
                class="border-b-2 border-transparent px-1 pt-1 pb-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Usage Analytics
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class PromotionsLayoutComponent {
}
