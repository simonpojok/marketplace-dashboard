import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {OrdersService} from '../../services/orders.service';
import {Order, OrderStatus} from '../../models/order.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'order-detail.component.html',
  styles: []
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ordersService = inject(OrdersService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isUpdating = signal(false);
  protected order = signal<Order | null>(null);
  protected showUpdateStatus = signal(false);

  // Status options for updating
  protected statusOptions = [
    {value: 'pending', label: 'Pending'},
    {value: 'processing', label: 'Processing'},
    {value: 'packed', label: 'Packed'},
    {value: 'shipped', label: 'Shipped'},
    {value: 'delivered', label: 'Delivered'},
    {value: 'cancelled', label: 'Cancelled'},
    {value: 'refunded', label: 'Refunded'}
  ];

  // Create form for status update
  protected statusForm = this.fb.group({
    status: ['', Validators.required],
    tracking_number: [''],
    payment_status: [false],
    notes: ['']
  });

  ngOnInit(): void {
    // Get the order ID from the route
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  private loadOrder(id: string): void {
    this.isLoading.set(true);
    this.ordersService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);

        // Populate the form with current values
        this.statusForm.patchValue({
          status: order.status,
          tracking_number: order.tracking_number || '',
          payment_status: order.payment_status
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.toastService.error('Failed to load order details');
        this.isLoading.set(false);
        this.router.navigate(['/orders']);
      }
    });
  }

  protected toggleUpdateStatus(): void {
    this.showUpdateStatus.set(!this.showUpdateStatus());
  }

  protected updateOrderStatus(): void {
    if (!this.order() || this.statusForm.invalid) return;

    this.isUpdating.set(true);


    // @ts-ignore
    this.ordersService.updateOrder(this.order()!.id, this.statusForm.value).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.showUpdateStatus.set(false);
        this.isUpdating.set(false);
        this.toastService.success('Order status updated successfully');
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.toastService.error('Failed to update order status');
        this.isUpdating.set(false);
      }
    });
  }

  protected cancelUpdate(): void {
    this.showUpdateStatus.set(false);

    // Reset form to current order values
    if (this.order()) {
      this.statusForm.patchValue({
        status: this.order()!.status,
        tracking_number: this.order()!.tracking_number || '',
        payment_status: this.order()!.payment_status
      });
    }
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
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
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
}
