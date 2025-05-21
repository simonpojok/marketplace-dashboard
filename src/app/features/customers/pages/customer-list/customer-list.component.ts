import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CustomersService} from '../../services/customers.service';
import {Customer} from '../../models/customer.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: 'customer-list.component.html',
  styles: []
})
export class CustomerListComponent implements OnInit {
  private customersService = inject(CustomersService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected customers = signal<Customer[]>([]);
  protected totalCustomers = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected searchTerm = signal('');
  protected sortBy = signal('date_joined');
  protected sortOrder = signal('desc');

  protected Math = Math;

  ngOnInit(): void {
    this.loadCustomers();
  }

  protected loadCustomers(page: number = 1): void {
    this.isLoading.set(true);

    const params = {
      page,
      page_size: this.pageSize(),
      search: this.searchTerm(),
      ordering: this.getSortString()
    };

    this.customersService.getCustomers(params).subscribe({
      next: (response) => {
        this.customers.set(response.results);
        this.totalCustomers.set(response.count);
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.toastService.error('Failed to load customers');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    this.loadCustomers(1);
  }

  protected onSort(field: string): void {
    if (this.sortBy() === field) {
      // Toggle sort order if same field is clicked
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
    this.loadCustomers(1);
  }

  protected getSortString(): string {
    return this.sortOrder() === 'desc' ? `-${this.sortBy()}` : this.sortBy();
  }

  protected onPageChange(page: number): void {
    this.loadCustomers(page);
  }

  protected formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return '—';

    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(dateString: string | undefined): string {
    if (!dateString) return '—';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected getInitials(name: string | undefined): string {
    if (!name) return '';

    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  protected getAvatarColor(index: number): string {
    // Generate a color from a set of colors based on the index
    const colors = [
      '#22c55e', // primary-500
      '#16a34a', // primary-600
      '#15803d', // primary-700
      '#3b82f6', // blue-500
      '#2563eb', // blue-600
      '#1d4ed8', // blue-700
    ];

    return colors[index % colors.length];
  }
}
