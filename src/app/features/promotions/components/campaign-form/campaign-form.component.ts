import {Component, Input, Output, EventEmitter, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Campaign, CampaignCreateRequest, CampaignType} from '../../models/campaign.model';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campaign-form.component.html',
  styles: []
})
export class CampaignFormComponent implements OnInit {
  @Input() campaign: Campaign | null = null;
  @Input() isEdit = false;
  @Input() isSubmitting = false;
  @Output() formSubmit = new EventEmitter<CampaignCreateRequest>();
  @Output() formCancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  protected imagePreview: string | null = null;
  protected selectedFile: File | null = null;

  protected typeOptions = [
    {value: 'flash_sale', label: 'Flash Sale'},
    {value: 'seasonal', label: 'Seasonal'},
    {value: 'clearance', label: 'Clearance'},
    {value: 'new_customer', label: 'New Customer'},
    {value: 'loyalty', label: 'Loyalty'},
    {value: 'bulk_discount', label: 'Bulk Discount'},
    {value: 'general', label: 'General'}
  ];

  protected campaignForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    campaign_type: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    is_featured: [false],
    priority: [0],
    max_usage_total: <number | undefined | unknown>[null],
    max_usage_per_user: <number | undefined | unknown>[null],
    target_new_customers_only: [false],
    minimum_order_amount: <number | undefined | unknown>[null],
    banner_text: ['']
  });

  ngOnInit(): void {
    if (this.campaign && this.isEdit) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (!this.campaign) return;

    this.campaignForm.patchValue({
      name: this.campaign.name,
      description: this.campaign.description,
      campaign_type: this.campaign.campaign_type,
      start_date: this.formatDateForInput(this.campaign.start_date),
      end_date: this.formatDateForInput(this.campaign.end_date),
      is_featured: this.campaign.is_featured,
      priority: this.campaign.priority,
      max_usage_total: this.campaign.max_usage_total,
      max_usage_per_user: this.campaign.max_usage_per_user,
      target_new_customers_only: this.campaign.target_new_customers_only,
      minimum_order_amount: this.campaign.minimum_order_amount,
      banner_text: this.campaign.banner_text || ''
    });

    if (this.campaign.banner_image_url) {
      this.imagePreview = this.campaign.banner_image_url;
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  protected onSubmit(): void {
    if (this.campaignForm.valid) {
      const formData: CampaignCreateRequest = {
        ...this.campaignForm.value as any,
        banner_image: this.selectedFile || undefined
      };
      this.formSubmit.emit(formData);
    }
  }

  protected onCancel(): void {
    this.formCancel.emit();
  }
}
