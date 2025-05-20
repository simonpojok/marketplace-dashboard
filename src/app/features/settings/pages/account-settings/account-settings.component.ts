import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../../core/auth/services/auth.service';
import {ToastService} from '../../../../core/services/toast.service';

interface LanguageOption {
  code: string;
  name: string;
}

interface TimeZoneOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styles: []
})
export class AccountSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected isDeleting = signal(false);
  protected showDeleteModal = signal(false);

  // Delete account confirmation
  protected deleteConfirmation = '';

  // Language options
  protected languageOptions: LanguageOption[] = [
    {code: 'en', name: 'English'},
    {code: 'fr', name: 'French'},
    {code: 'es', name: 'Spanish'},
    {code: 'sw', name: 'Swahili'}
  ];

  // Timezone options
  protected timezoneOptions: TimeZoneOption[] = [
    {code: 'Africa/Kampala', name: 'East Africa Time (EAT / UTC+3)'},
    {code: 'Africa/Lagos', name: 'West Africa Time (WAT / UTC+1)'},
    {code: 'Europe/London', name: 'GMT (UTC+0)'},
    {code: 'America/New_York', name: 'Eastern Time (ET / UTC-5)'},
    {code: 'America/Los_Angeles', name: 'Pacific Time (PT / UTC-8)'}
  ];

  // Form groups
  protected preferencesForm = this.fb.group({
    language: ['en', Validators.required],
    timezone: ['Africa/Kampala', Validators.required],
    dateFormat: ['DD/MM/YYYY', Validators.required],
    currency: ['UGX', Validators.required]
  });

  ngOnInit(): void {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    this.isLoading.set(true);

    // In a real application, you would fetch the user's preferences from the API
    // For this example, we'll simulate a delay and then populate the form with fake data
    setTimeout(() => {
      this.preferencesForm.patchValue({
        language: 'en',
        timezone: 'Africa/Kampala',
        dateFormat: 'DD/MM/YYYY',
        currency: 'UGX'
      });

      this.isLoading.set(false);
    }, 800);
  }

  protected onPreferencesSave(): void {
    if (this.preferencesForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    // Prepare data for API
    const formData = {
      language: this.preferencesForm.value.language,
      timezone: this.preferencesForm.value.timezone,
      date_format: this.preferencesForm.value.dateFormat,
      currency: this.preferencesForm.value.currency
    };

    // In a real application, you would send this data to the API
    // For this example, we'll simulate a delay and then show a success message
    setTimeout(() => {
      this.isSaving.set(false);
      this.toastService.success('Preferences saved successfully');
    }, 800);
  }

  protected resetPreferencesForm(): void {
    // Reset form to original values from the server
    this.loadPreferences();
  }

  protected confirmDeleteAccount(): void {
    this.showDeleteModal.set(true);
  }

  protected cancelDeleteAccount(): void {
    this.showDeleteModal.set(false);
    this.deleteConfirmation = '';
  }

  protected deleteAccount(): void {
    if (this.deleteConfirmation !== 'delete my account') {
      return;
    }

    this.isDeleting.set(true);

    // In a real application, you would send a request to the API to delete the account
    // For this example, we'll simulate a delay and then log the user out
    setTimeout(() => {
      this.isDeleting.set(false);
      this.showDeleteModal.set(false);
      this.toastService.success('Your account has been deleted');

      // Log the user out
      this.authService.logout().subscribe();
    }, 2000);
  }
}
