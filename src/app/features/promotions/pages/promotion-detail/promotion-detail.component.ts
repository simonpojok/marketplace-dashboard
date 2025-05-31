import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PromotionsService } from '../../services/promotions.service';
import { ToastService } from '../../../../core/services/toast.service';
import {Promotion} from '../../models/promotion.model';

@Component({
  selector: 'app-promotion-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promotion-detail.component.html',
  styles: []
})
export class PromotionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isLoading = signal(true);
  protected promotion = signal<Promotion | null>(null);

  ngOnInit(): void {
    const promotionId = this.route.snapshot.paramMap.get('id');
    if (promotionId) {
      this.loadPromotion(promotionId);
    }
  }

  private loadPromotion(id: string): void {
    this.promotionsService.getPromotion(id).subscribe({
      next: (promotion) => {
        this.promotion.set(promotion);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading promotion:', error);
        this.toastService.error('Failed to load promotion');
        this.router.navigate(['/promotions/promotions']);
      }
    });
  }

  protected duplicatePromotion(): void {
    const promotion = this.promotion();
    if (!promotion) return;

    if (confirm(`Create a copy of "${promotion.name}"?`)) {
      const duplicateData = {
        campaign: promotion.campaign,
        name: `${promotion.name} (Copy)`,
        description: promotion.description,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        max_discount_amount: promotion.max_discount_amount,
        apply_to: promotion.apply_to,
        products: promotion.products,
        categories: promotion.categories,
        brands: promotion.brands,
        buy_quantity: promotion.buy_quantity,
        get_quantity: promotion.get_quantity,
        get_discount_percentage: promotion.get_discount_percentage,
        minimum_quantity: promotion.minimum_quantity,
        minimum_amount: promotion.minimum_amount,
        priority: promotion.priority,
        is_active: false, // Create as inactive
        is_stackable: promotion.is_stackable
      };

      this.promotionsService.createPromotion(duplicateData).subscribe({
        next: (newPromotion) => {
          this.toastService.success('Promotion duplicated successfully');
          this.router.navigate(['/promotions/promotions', newPromotion.id]);
        },
        error: (error) => {
          console.error('Error duplicating promotion:', error);
          this.toastService.error('Failed to duplicate promotion');
        }
      });
    }
  }

  protected deletePromotion(): void {
    const promotion = this.promotion();
    if (!promotion) return;

    if (confirm(`Are you sure you want to delete "${promotion.name}"?`)) {
      this.promotionsService.deletePromotion(promotion.id).subscribe({
        next: () => {
          this.toastService.success('Promotion deleted successfully');
          this.router.navigate(['/promotions/promotions']);
        },
        error: (error) => {
          console.error('Error deleting promotion:', error);
          this.toastService.error('Failed to delete promotion');
        }
      });
    }
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
