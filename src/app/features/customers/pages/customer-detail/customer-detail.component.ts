import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomersService} from '../../services/customers.service';
import {Customer, CustomerOrder} from '../../models/customer.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './customer-detail.component.html',
  styles: []
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private customersService = inject(CustomersService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isLoadingOrders = signal(true);
  protected isEditing = signal(false);
  protected isSaving = signal(false);
  protected customer = signal<Customer | null>(null);
  protected customerOrders = signal<CustomerOrder[]>([]);
  protected totalOrders = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(5);

  // Edit form
  protected customerForm!: FormGroup;

  protected Math = Math;

  ngOnInit(): void {
    // Initialize form
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      address: ['']
    });

    // Get the customer ID from the route
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.loadCustomer(customerId);
      this.loadCustomerOrders(customerId);
    } else {
      this.router.navigate(['/customers']);
    }
  }

  private loadCustomer(id: string): void {
    this.isLoading.set(true);
    this.customersService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);

        // Populate the form with customer data
        this.customerForm.patchValue({
          name: customer.name || '',
          email: customer.email || '',
          address: customer.address || ''
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.toastService.error('Failed to load customer details');
        this.isLoading.set(false);
        this.router.navigate(['/customers']);
      }
    });
  }

  private loadCustomerOrders(id: string, page: number = 1): void {
    this.isLoadingOrders.set(true);
    const params = {
      page,
      page_size: this.pageSize()
    };

    this.customersService.getCustomerOrders(id, params).subscribe({
      next: (response) => {
        this.customerOrders.set(response.results);
        this.totalOrders.set(response.count);
        this.currentPage.set(page);
        this.isLoadingOrders.set(false);
      },
      error: (error) => {
        console.error('Error loading customer orders:', error);
        this.toastService.error('Failed to load customer orders');
        this.isLoadingOrders.set(false);
      }
    });
  }

  protected onPageChange(page: number): void {
    if (this.customer()) {
      this.loadCustomerOrders(this.customer()!.id, page);
    }
  }

  protected toggleEdit(): void {
    this.isEditing.set(!this.isEditing());

    if (!this.isEditing() && this.customer()) {
      // Reset form to original values if cancelling edit
      this.customerForm.patchValue({
        name: this.customer()!.name || '',
        email: this.customer()!.email || '',
        address: this.customer()!.address || ''
      });
    }
  }

  protected saveCustomer(): void {
    if (this.customerForm.invalid || !this.customer()) return;

    this.isSaving.set(true);

    this.customersService.updateCustomer(this.customer()!.id, this.customerForm.value).subscribe({
      next: (updatedCustomer) => {
        this.customer.set(updatedCustomer);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.toastService.success('Customer details updated successfully');
      },
      error: (error) => {
        console.error('Error updating customer:', error);
        this.toastService.error('Failed to update customer details');
        this.isSaving.set(false);
      }
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

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'packed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}
