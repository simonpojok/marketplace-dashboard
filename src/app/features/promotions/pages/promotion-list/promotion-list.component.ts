import {Component, OnInit, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {PromotionsService} from '../../services/promotions.service';
import {Promotion, DiscountType} from '../../models/campaign.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promotion-list.component.html',
  styles: []
})
export class PromotionListComponent implements OnInit {
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  // Reactive state
  protected isLoading = signal(true);
  protected promotions = signal<Promotion[]>([]);

  // Filters
  protected searchTerm = signal('');
  protected selectedCampaign = signal('');
  protected selectedDiscountType = signal<DiscountType | ''>('');
  protected selectedStatus = signal('');

  // Options
  protected discountTypeOptions = [
    {value: 'percentage', label: 'Percentage'},
    {value: 'fixed_amount', label: 'Fixed Amount'},
    {value: 'buy_x_get_y', label: 'Buy X Get Y'},
    {value: 'free_shipping', label: 'Free Shipping'}
  ];

  ngOnInit(): void {
    this.loadPromotions();
  }

  protected loadPromotions(): void {
    this.isLoading.set(true);

    // Build filter params
    const params: any = {};
    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedCampaign()) params.campaign = this.selectedCampaign();
    if (this.selectedDiscountType()) params.discount_type = this.selectedDiscountType();
    if (this.selectedStatus()) params.is_active = this.selectedStatus() === 'true';

    this.promotionsService.getPromotions().subscribe({
      next: (promotions) => {
        this.promotions.set(promotions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.toastService.error('Failed to load promotions');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    this.loadPromotions();
  }

  protected onFilter(): void {
    this.loadPromotions();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCampaign.set('');
    this.selectedDiscountType.set('');
    this.selectedStatus.set('');
    this.loadPromotions();
  }

  protected deletePromotion(promotion: Promotion): void {
    if (confirm(`Are you sure you want to delete "${promotion.name}"?`)) {
      this.promotionsService.deletePromotion(promotion.id).subscribe({
        next: () => {
          this.toastService.success('Promotion deleted successfully');
          this.loadPromotions();
        },
        error: (error) => {
          console.error('Error deleting promotion:', error);
          this.toastService.error('Failed to delete promotion');
        }
      });
    }
  }
}
