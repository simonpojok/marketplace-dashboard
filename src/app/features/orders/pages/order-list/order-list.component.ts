import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {OrdersService} from '../../services/orders.service';
import {Order, OrderFilterParams, OrderStatus} from '../../models/order.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: 'order-list.component.html',
  styles: []
})
export class OrderListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected orders = signal<Order[]>([]);
  protected totalOrders = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected searchTerm = signal('');
  protected selectedStatus = signal<OrderStatus | '' | undefined>('');
  protected selectedPaymentMethod = signal('');
  protected dateFrom = signal('');
  protected dateTo = signal('');
  protected sortBy = signal('created_at');
  protected sortOrder = signal('desc');

  // For page title
  protected routeStatus = signal<OrderStatus | ''>('');

  // Available status options
  protected statusOptions = [
    {value: 'pending', label: 'Pending'},
    {value: 'processing', label: 'Processing'},
    {value: 'packed', label: 'Packed'},
    {value: 'shipped', label: 'Shipped'},
    {value: 'delivered', label: 'Delivered'},
    {value: 'cancelled', label: 'Cancelled'},
    {value: 'refunded', label: 'Refunded'}
  ];

  // Available payment method options
  protected paymentMethodOptions = [
    {value: 'mtn_mobile_money', label: 'MTN Mobile Money'},
    {value: 'airtel_money', label: 'Airtel Money'},
    {value: 'bank_transfer', label: 'Bank Transfer'},
    {value: 'cash_on_delivery', label: 'Cash on Delivery'}
  ];

  protected Math = Math;

  ngOnInit(): void {
    // Check if we have a specific status from route data
    this.route.data.subscribe(data => {
      if (data['status']) {
        this.routeStatus.set(data['status']);
        this.selectedStatus.set(data['status']);
      }
    });

    this.loadOrders();
  }

  protected loadOrders(page: number = 1): void {
    this.isLoading.set(true);

    const params: OrderFilterParams = {
      page,
      page_size: this.pageSize(),
      search: this.searchTerm(),
      // @ts-ignore
      status: this.selectedStatus(),
      // @ts-ignore
      payment_method: this.selectedPaymentMethod(),
      date_from: this.dateFrom(),
      date_to: this.dateTo(),
      ordering: this.getSortString()
    };

    this.ordersService.getOrders(params).subscribe({
      next: (response) => {
        this.orders.set(response.results);
        this.totalOrders.set(response.count);
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.toastService.error('Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    this.loadOrders(1);
  }

  protected onFilter(): void {
    this.loadOrders(1);
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
    this.loadOrders(1);
  }

  protected getSortString(): string {
    return this.sortOrder() === 'desc' ? `-${this.sortBy()}` : this.sortBy();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(this.routeStatus());
    this.selectedPaymentMethod.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.sortBy.set('created_at');
    this.sortOrder.set('desc');
    this.loadOrders(1);
  }

  protected onPageChange(page: number): void {
    this.loadOrders(page);
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
      month: 'short',
      day: 'numeric'
    });
  }

  protected getStatusClass(status: OrderStatus): string {
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

  protected getPaymentMethodDisplay(method: string): string {
    const paymentMethod = this.paymentMethodOptions.find(option => option.value === method);
    return paymentMethod ? paymentMethod.label : method;
  }
}
