import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './stats-card.component.html',
  styles: []
})
export class StatsCardComponent {
  @Input() title = '';
  @Input() value = 0;
  @Input() change = 0;
  @Input() icon = 'document';
  @Input() format: 'currency' | 'number' = 'number';

  protected Math = Math;

  protected getIconBackgroundClass(): string {
    switch (this.icon) {
      case 'cash':
        return 'bg-primary-500';
      case 'shopping-bag':
        return 'bg-blue-500';
      case 'users':
        return 'bg-yellow-500';
      case 'chart-bar':
        return 'bg-purple-500';
      default:
        return 'bg-primary-500';
    }
  }

  protected getChangeClass(): string {
    if (this.change > 0) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    } else if (this.change < 0) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  protected formatCurrency(value: number): string {
    // Format as UGX (Uganda Shillings)
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(value);
  }
}
