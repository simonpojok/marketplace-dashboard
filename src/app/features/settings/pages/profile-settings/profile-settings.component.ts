import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../core/auth/services/auth.service';
import {ToastService} from '../../../../core/services/toast.service';
import {UpdateUserProfileRequest, UserProfile, UserService} from '../../../../core/services/user.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'profile-settings.component.html',
  styles: []
})
export class ProfileSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected submitted = false;

  // User data
  protected userProfile: UserProfile | null = null;

  // Form group
  protected profileForm = this.fb.group({
    name: ['', Validators.required],
    phone_number: [{value: '', disabled: true}],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    bio: ['']
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading.set(true);

    // Try to get profile from primary endpoint
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.handleProfileLoaded(response);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);

        // Try alternative endpoint if the first one fails
        this.tryAlternativeEndpoint();
      }
    });
  }

  private tryAlternativeEndpoint(): void {
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        this.handleProfileLoaded(response);
      },
      error: (error) => {
        console.error('Error loading user profile from alternative endpoint:', error);
        this.toastService.error('Failed to load user profile from server');
        this.isLoading.set(false);
      }
    });
  }

  private handleProfileLoaded(response: UserProfile): void {
    console.log('Profile data received:', response);
    this.userProfile = response;

    // Populate form with user data
    this.profileForm.patchValue({
      name: response.name || '',
      phone_number: response.phone_number || '',
      email: response.email || '',
      address: response.address || '',
      bio: response.profile?.bio || ''
    });

    this.isLoading.set(false);
  }

  protected onSubmit(): void {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.toastService.warning('Please fill in all required fields correctly');
      return;
    }

    this.isSaving.set(true);

    // Prepare data for API
    const formData: UpdateUserProfileRequest = {
      name: this.profileForm.value.name || undefined,
      email: this.profileForm.value.email || undefined,
      address: this.profileForm.value.address || undefined,
      profile: {
        bio: this.profileForm.value.bio || undefined
      }
    };

    // Remove undefined values
    Object.keys(formData).forEach(key => {
      if (formData[key as keyof UpdateUserProfileRequest] === undefined) {
        delete formData[key as keyof UpdateUserProfileRequest];
      }
    });

    if (formData.profile && Object.keys(formData.profile).length === 0) {
      delete formData.profile;
    }

    this.userService.updateProfile(formData).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.toastService.success('Profile updated successfully');
        this.submitted = false;

        // Update local user data
        this.userProfile = response;

        // Update auth service if it has a method to refresh user data
        this.refreshAuthService();
      },
      error: (error) => {
        this.isSaving.set(false);
        this.handleUpdateError(error);
      }
    });
  }

  private handleUpdateError(error: any): void {
    console.error('Error updating profile:', error);

    if (error.status === 400) {
      // Handle validation errors
      const errors = error.error;
      console.log('Validation errors:', errors);

      if (errors.email) {
        this.toastService.error(`Email: ${errors.email[0]}`);
      } else if (errors.name) {
        this.toastService.error(`Name: ${errors.name[0]}`);
      } else if (errors.profile?.bio) {
        this.toastService.error(`Bio: ${errors.profile.bio[0]}`);
      } else {
        this.toastService.error('Failed to update profile. Please check your input.');
      }
    } else if (error.status === 401) {
      this.toastService.error('Session expired. Please log in again.');
      this.authService.logout().subscribe();
    } else if (error.status === 403) {
      this.toastService.error('You do not have permission to perform this action.');
    } else {
      this.toastService.error('An error occurred. Please try again later.');
    }
  }

  private refreshAuthService(): void {
    // Update auth service if it has a method to refresh user data
    if (typeof this.authService.refreshProfile === 'function') {
      this.authService.refreshProfile();
    } else if (typeof this.authService.getProfile === 'function') {
      this.authService.getProfile().subscribe({
        next: () => console.log('Auth service profile refreshed'),
        error: (error) => console.log('Error refreshing auth service profile:', error)
      });
    }
  }

  protected resetForm(): void {
    this.submitted = false;

    // Reset form to original values
    if (this.userProfile) {
      this.profileForm.patchValue({
        name: this.userProfile.name || '',
        phone_number: this.userProfile.phone_number || '',
        email: this.userProfile.email || '',
        address: this.userProfile.address || '',
        bio: this.userProfile.profile?.bio || ''
      });
    }
  }

  protected getInitials(): string {
    const name = this.userProfile?.name || 'User';

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  protected formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
