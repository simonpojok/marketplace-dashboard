import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignFormComponent } from '../../components/campaign-form/campaign-form.component';
import { PromotionsService } from '../../services/promotions.service';
import { Campaign, CampaignCreateRequest } from '../../models/campaign.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-campaign-edit',
  standalone: true,
  imports: [CommonModule, CampaignFormComponent],
  templateUrl: './campaign-edit.component.html',
  styles: []
})
export class CampaignEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isLoading = signal(true);
  protected isSubmitting = signal(false);
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

  protected onSubmit(formData: CampaignCreateRequest): void {
    const campaign = this.campaign();
    if (!campaign) return;

    this.isSubmitting.set(true);

    this.promotionsService.updateCampaign(campaign.id, formData).subscribe({
      next: (updatedCampaign) => {
        this.toastService.success('Campaign updated successfully');
        this.router.navigate(['/promotions/campaigns', updatedCampaign.id]);
      },
      error: (error) => {
        console.error('Error updating campaign:', error);
        this.toastService.error(error.error?.message || 'Failed to update campaign');
        this.isSubmitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    const campaign = this.campaign();
    if (campaign) {
      this.router.navigate(['/promotions/campaigns', campaign.id]);
    } else {
      this.router.navigate(['/promotions/campaigns']);
    }
  }
}
