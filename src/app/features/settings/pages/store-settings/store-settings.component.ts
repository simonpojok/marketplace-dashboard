import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {StoreSettingsService} from '../../services/store-settings.service';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './store-settings.component.html',
  styleUrls: ['./store-settings.component.css']
})
export class StoreSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private storeSettingsService: StoreSettingsService,
    private toastService: ToastService
  ) {
    // Initialize the form with empty values
    this.settingsForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(3)]],
      storeEmail: ['', [Validators.required, Validators.email]],
      storePhone: ['', [Validators.required]],
      storeAddress: ['', [Validators.required]],
      storeCurrency: ['UGX', [Validators.required]],
      storeTimeZone: ['Africa/Kampala', [Validators.required]],
      enableTax: [false],
      taxRate: [5],
      enableShipping: [true],
      flatShippingRate: [5000],
      enableDiscounts: [true],
      enableProductReviews: [true],
      orderConfirmationEmail: [true],
      shippingConfirmationEmail: [true],
      deliveryConfirmationEmail: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.storeSettingsService.getStoreSettings().subscribe({
      next: (settings) => {
        this.settingsForm.patchValue(settings);
        this.isLoading = false;
      },
      error: (error) => {
        this.toastService.error('Failed to load store settings');
        console.error('Error loading settings:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      // Mark all form controls as touched to reveal validation errors
      Object.keys(this.settingsForm.controls).forEach(key => {
        const control = this.settingsForm.get(key);
        control?.markAsTouched();
      });
      this.toastService.warning('Please correct the errors in the form');
      return;
    }

    this.isSaving = true;
    this.storeSettingsService.updateStoreSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.toastService.success('Store settings updated successfully');
        this.isSaving = false;
      },
      error: (error) => {
        this.toastService.error('Failed to update store settings');
        console.error('Error updating settings:', error);
        this.isSaving = false;
      }
    });
  }

  // Toggle for checkbox controls
  toggleSetting(controlName: string): void {
    const control = this.settingsForm.get(controlName);
    if (control) {
      control.setValue(!control.value);
    }
  }

  // Helper to check if control is invalid and touched
  isInvalid(controlName: string): boolean {
    const control = this.settingsForm.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  // Reset form to the last saved settings
  resetForm(): void {
    this.loadSettings();
    this.toastService.info('Form has been reset to the last saved settings');
  }
}
