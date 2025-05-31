import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  active?: boolean;
}

@Component({
  selector: 'app-promotions-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a
            routerLink="/dashboard"
            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
            </svg>
            Dashboard
          </a>
        </li>

        <li>
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="currentColor"
                 viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"/>
            </svg>
            <a
              routerLink="/promotions"
              class="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
            >
              Promotions
            </a>
          </div>
        </li>

        <li *ngFor="let item of items; let last = last">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="currentColor"
                 viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"/>
            </svg>
            <a
              *ngIf="item.link && !last"
              [routerLink]="item.link"
              class="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
            >
              {{ item.label }}
            </a>
            <span
              *ngIf="!item.link || last"
              class="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400"
              [class.text-primary-600]="last"
              [class.dark:text-primary-400]="last"
            >
              {{ item.label }}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  `
})
export class PromotionsBreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}

// Usage examples:

// For Campaign List:
// <app-promotions-breadcrumb [items]="[{label: 'Campaigns'}]"></app-promotions-breadcrumb>

// For Campaign Detail:
// <app-promotions-breadcrumb [items]="[
//   {label: 'Campaigns', link: '/promotions/campaigns'},
//   {label: campaign?.name || 'Campaign Details'}
// ]"></app-promotions-breadcrumb>

// For Campaign Create:
// <app-promotions-breadcrumb [items]="[
//   {label: 'Campaigns', link: '/promotions/campaigns'},
//   {label: 'Create Campaign'}
// ]"></app-promotions-breadcrumb>
