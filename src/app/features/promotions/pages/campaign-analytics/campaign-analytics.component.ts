import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {PromotionsService} from '../../services/promotions.service';
import {CampaignAnalytics} from '../../models/campaign.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-campaign-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaign-analytics.component.html',
  styles: []
})
export class CampaignAnalyticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isLoading = signal(true);
  protected analytics = signal<CampaignAnalytics | null>(null);
  protected campaignId = '';

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('id') || '';
    if (this.campaignId) {
      this.loadAnalytics();
    }
  }

  private loadAnalytics(): void {
    this.isLoading.set(true);

    this.promotionsService.getCampaignAnalytics(this.campaignId).subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.toastService.error('Failed to load analytics data');
        this.isLoading.set(false);
      }
    });
  }

  protected refreshAnalytics(): void {
    this.loadAnalytics();
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected getRepeatRate(): string {
    const analytics = this.analytics();
    if (!analytics?.user_engagement) return '0';

    const {unique_users, repeat_users} = analytics.user_engagement;
    if (unique_users === 0) return '0';

    const rate = (repeat_users / unique_users) * 100;
    return rate.toFixed(1);
  }
}
