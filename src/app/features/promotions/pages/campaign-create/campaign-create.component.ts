import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {CampaignFormComponent} from '../../components/campaign-form/campaign-form.component';
import {PromotionsService} from '../../services/promotions.service';
import {CampaignCreateRequest} from '../../models/campaign.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [CommonModule, CampaignFormComponent],
  templateUrl: './campaign-create.component.html',
  styles: []
})
export class CampaignCreateComponent {
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private toastService = inject(ToastService);

  protected isSubmitting = false;

  protected onSubmit(formData: CampaignCreateRequest): void {
    this.isSubmitting = true;

    this.promotionsService.createCampaign(formData).subscribe({
      next: (campaign) => {
        this.toastService.success('Campaign created successfully');
        this.router.navigate(['/promotions/campaigns', campaign.id]);
      },
      error: (error) => {
        console.error('Error creating campaign:', error);
        this.toastService.error(error.error?.message || 'Failed to create campaign');
        this.isSubmitting = false;
      }
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/promotions/campaigns']).then();
  }
}
