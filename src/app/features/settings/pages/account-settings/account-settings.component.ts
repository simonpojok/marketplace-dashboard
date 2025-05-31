import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../core/auth/services/auth.service';
import {ToastService} from '../../../../core/services/toast.service';
import {UserService} from '../../../../core/services/user.service';

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
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: 'account-settings.component.html',
  styles: []
})
export class AccountSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
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

    this.userService.getProfile().subscribe({
      next: (profile) => {
        // Update form with profile data
        this.preferencesForm.patchValue({
          language: profile.profile?.language || 'en',
          timezone: profile.profile?.timezone || 'Africa/Kampala',
          dateFormat: 'DD/MM/YYYY', // This might need to be added to backend
          currency: 'UGX' // This might need to be added to backend
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading preferences:', error);
        this.toastService.error('Failed to load account preferences');
        this.isLoading.set(false);
      }
    });
  }

  protected onPreferencesSave(): void {
    if (this.preferencesForm.invalid) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);

    // Prepare data for API
    const formData = {
      profile: {
        language: this.preferencesForm.value.language,
        timezone: this.preferencesForm.value.timezone
        // dateFormat and currency would need to be added to backend model
      }
    };

    // @ts-ignore
    this.userService.updateProfile(formData).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.toastService.success('Preferences saved successfully');
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error saving preferences:', error);
        this.toastService.error('Failed to save preferences');
      }
    });
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
      this.toastService.warning('Please type "delete my account" to confirm');
      return;
    }

    this.isDeleting.set(true);

    this.userService.deleteAccount().subscribe({
      next: (response) => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.toastService.success('Your account has been deleted');

        // Log the user out after successful deletion
        this.authService.logout().subscribe();
      },
      error: (error) => {
        this.isDeleting.set(false);
        console.error('Error deleting account:', error);

        if (error.status === 403) {
          this.toastService.error('You do not have permission to delete this account');
        } else {
          this.toastService.error('Failed to delete account. Please try again.');
        }
      }
    });
  }
}
