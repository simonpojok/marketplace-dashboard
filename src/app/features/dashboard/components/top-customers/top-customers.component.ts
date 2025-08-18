import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopCustomer } from '../../models/dashboard.model';

@Component({
  selector: 'app-top-customers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-customers.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopCustomersComponent {
  @Input() customers: TopCustomer[] = [];
  @Input() isLoading = false;

  // Avatar colors (a nice gradient of greens and blues)
  private avatarColors = [
    '#22c55e', // primary-500
    '#16a34a', // primary-600
    '#15803d', // primary-700
    '#3b82f6', // blue-500
    '#2563eb', // blue-600
    '#1d4ed8', // blue-700
  ];

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(value);
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);

    // Check if it's today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Check if it's yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Otherwise, show a regular date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getInitials(name: string): string {
    if (!name) return '';

    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  protected getAvatarColor(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }
}
