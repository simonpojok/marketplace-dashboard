import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {PromotionsService} from '../../services/promotions.service';
import {Campaign} from '../../models/campaign.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaign-detail.component.html',
  styles: []
})
export class CampaignDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isLoading = signal(true);
  protected campaign = signal<Campaign | null>(null);

  ngOnInit(): void {
    const campaignId = this.route.snapshot.paramMap.get('id');
    if (campaignId) {
      this.loadCampaign(campaignId);
    }
  }

  private loadCampaign(id: string): void {
    this.promotionsService.getCampaign(id).subscribe({
      next: (campaign) => {
        this.campaign.set(campaign);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading campaign:', error);
        this.toastService.error('Failed to load campaign');
        this.router.navigate(['/promotions/campaigns']);
      }
    });
  }

  protected activateCampaign(): void {
    const campaign = this.campaign();
    if (!campaign) return;

    this.promotionsService.activateCampaign(campaign.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadCampaign(campaign.id);
      },
      error: (error) => {
        console.error('Error activating campaign:', error);
        this.toastService.error('Failed to activate campaign');
      }
    });
  }

  protected deactivateCampaign(): void {
    const campaign = this.campaign();
    if (!campaign) return;

    this.promotionsService.deactivateCampaign(campaign.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadCampaign(campaign.id);
      },
      error: (error) => {
        console.error('Error deactivating campaign:', error);
        this.toastService.error('Failed to deactivate campaign');
      }
    });
  }

  protected deleteCampaign(): void {
    const campaign = this.campaign();
    if (!campaign) return;

    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      this.promotionsService.deleteCampaign(campaign.id).subscribe({
        next: () => {
          this.toastService.success('Campaign deleted successfully');
          this.router.navigate(['/promotions/campaigns']);
        },
        error: (error) => {
          console.error('Error deleting campaign:', error);
          this.toastService.error('Failed to delete campaign');
        }
      });
    }
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  protected getStatusClass(status: string): string {
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
}
