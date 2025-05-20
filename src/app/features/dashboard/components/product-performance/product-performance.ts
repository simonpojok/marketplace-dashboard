import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {TopProduct} from '../../models/dashboard.model';

@Component({
  selector: 'app-product-performance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-performance.html',
  styles: []
})
export class ProductPerformanceComponent {
  @Input() productData: TopProduct[] = [];
  @Input() isLoading = false;

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(value);
  }

  protected getPerformanceColor(performance: number): string {
    if (performance >= 15) {
      return 'bg-green-500';
    } else if (performance >= 0) {
      return 'bg-primary-500';
    } else if (performance >= -10) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  }

  protected getPerformanceTextColor(performance: number): string {
    if (performance >= 15) {
      return 'text-green-600 dark:text-green-400';
    } else if (performance >= 0) {
      return 'text-primary-600 dark:text-primary-400';
    } else if (performance >= -10) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  }

  protected getPerformanceWidth(performance: number): number {
    // Map the performance to a width percentage (min 5%, max 100%)
    const absPerformance = Math.abs(performance);

    // For a very good performance (25%+), we want the bar to be 100% full
    if (absPerformance >= 25) {
      return 100;
    }

    // Otherwise, scale from 5% to 100% based on performance between 0% and 25%
    return 5 + ((absPerformance / 25) * 95);
  }
}
