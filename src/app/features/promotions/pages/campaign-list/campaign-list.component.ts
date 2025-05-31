import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromotionsService } from '../../services/promotions.service';
import { Campaign, CampaignFilterParams, CampaignStatus, CampaignType } from '../../models/campaign.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './campaign-list.component.html',
  styles: []
})
export class CampaignListComponent implements OnInit {
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  // Reactive state
  protected isLoading = signal(true);
  protected campaigns = signal<Campaign[]>([]);
  protected totalCampaigns = signal(0);
  protected currentPage = signal(1);
  protected pageSize = signal(10);

  // Filters
  protected searchTerm = signal('');
  protected selectedStatus = signal<CampaignStatus | ''>('');
  protected selectedType = signal<CampaignType | ''>('');
  protected selectedFeatured = signal<boolean | null>(null);
  protected sortBy = signal('created_at');
  protected sortOrder = signal('desc');

  // Options
  protected statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  protected typeOptions = [
    { value: 'flash_sale', label: 'Flash Sale' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'clearance', label: 'Clearance' },
    { value: 'new_customer', label: 'New Customer' },
    { value: 'loyalty', label: 'Loyalty' },
    { value: 'bulk_discount', label: 'Bulk Discount' },
    { value: 'general', label: 'General' }
  ];

  // Computed values
  protected totalPages = computed(() => Math.ceil(this.totalCampaigns() / this.pageSize()));

  ngOnInit(): void {
    this.loadCampaigns();
  }

  protected loadCampaigns(page: number = 1): void {
    this.isLoading.set(true);

    const params: CampaignFilterParams = {
      page,
      page_size: this.pageSize(),
      search: this.searchTerm() || undefined,
      status: this.selectedStatus() || undefined,
      campaign_type: this.selectedType() || undefined,
      is_featured: this.selectedFeatured() ?? undefined,
      ordering: this.getSortString()
    };

    this.promotionsService.getCampaigns(params).subscribe({
      next: (response) => {
        this.campaigns.set(response.results);
        this.totalCampaigns.set(response.count);
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.toastService.error('Failed to load campaigns');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    this.loadCampaigns(1);
  }

  protected onFilter(): void {
    this.loadCampaigns(1);
  }

  protected onSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
    this.loadCampaigns(1);
  }

  protected getSortString(): string {
    return this.sortOrder() === 'desc' ? `-${this.sortBy()}` : this.sortBy();
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedType.set('');
    this.selectedFeatured.set(null);
    this.sortBy.set('created_at');
    this.sortOrder.set('desc');
    this.loadCampaigns(1);
  }

  protected onPageChange(page: number): void {
    this.loadCampaigns(page);
  }

  protected activateCampaign(campaign: Campaign): void {
    this.promotionsService.activateCampaign(campaign.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadCampaigns(this.currentPage());
      },
      error: (error) => {
        console.error('Error activating campaign:', error);
        this.toastService.error('Failed to activate campaign');
      }
    });
  }

  protected deactivateCampaign(campaign: Campaign): void {
    this.promotionsService.deactivateCampaign(campaign.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadCampaigns(this.currentPage());
      },
      error: (error) => {
        console.error('Error deactivating campaign:', error);
        this.toastService.error('Failed to deactivate campaign');
      }
    });
  }

  protected deleteCampaign(campaign: Campaign): void {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      this.promotionsService.deleteCampaign(campaign.id).subscribe({
        next: () => {
          this.toastService.success('Campaign deleted successfully');
          this.loadCampaigns(this.currentPage());
        },
        error: (error) => {
          console.error('Error deleting campaign:', error);
          this.toastService.error('Failed to delete campaign');
        }
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
      month: 'short',
      day: 'numeric'
    });
  }

  protected getStatusClass(status: CampaignStatus): string {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  protected getTypeClass(type: CampaignType): string {
    switch (type) {
      case 'flash_sale':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'seasonal':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'clearance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'new_customer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'loyalty':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'bulk_discount':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'general':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  protected readonly Math = Math;
}
