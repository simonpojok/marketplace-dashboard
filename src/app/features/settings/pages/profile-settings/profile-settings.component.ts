import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '../../../../core/auth/services/auth.service';
import {ToastService} from '../../../../core/services/toast.service';
import {User} from '../../../../core/auth/models/user.model';
import {UserProfile} from '../../../../core/auth/models/user-profile.model';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'profile-settings.component.html',
  styles: []
})
export class ProfileSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
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

    // Get user data from auth service
    this.userProfile = this.authService.profile();

    if (this.userProfile) {
      // Populate form with user data
      this.profileForm.patchValue({
        name: this.userProfile.user.name || '',
        phone_number: this.userProfile.user.phone_number || '',
        email: this.userProfile.user.email || '',
        address: this.userProfile.user.address || ''
      });

      this.isLoading.set(false);
    } else {
      // If user data is not available in the auth service, fetch it
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.userProfile = user;

          // Populate form with user data
          this.profileForm.patchValue({
            name: user.user.name || '',
            phone_number: user.user.phone_number || '',
            email: user.user.email || '',
            address: user.user.address || ''
          });

          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.toastService.error('Failed to load user profile');
          this.isLoading.set(false);
        }
      });
    }
  }

  protected onSubmit(): void {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    // Prepare data for API
    const formData = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      address: this.profileForm.value.address,
      bio: this.profileForm.value.bio
    };

    // API call to update profile
    const apiUrl = `${environment.apiUrl}${environment.apiVersion}/users/profile/`;
    this.http.patch(apiUrl, formData).subscribe({
      next: (response: any) => {
        this.isSaving.set(false);
        this.toastService.success('Profile updated successfully');

        // Update user data in auth service
        this.authService.getProfile().subscribe();
      },
      error: (error) => {
        this.isSaving.set(false);

        if (error.status === 400) {
          // Handle validation errors
          const errors = error.error;

          if (errors.email) {
            this.toastService.error(`Email: ${errors.email[0]}`);
          } else {
            this.toastService.error('Failed to update profile');
          }
        } else {
          this.toastService.error('An error occurred. Please try again later.');
        }

        console.error('Error updating profile:', error);
      }
    });
  }

  protected resetForm(): void {
    this.submitted = false;

    // Reset form to original values
    if (this.userProfile) {
      this.profileForm.patchValue({
        name: this.userProfile.user.name || '',
        phone_number: this.userProfile.user.phone_number || '',
        email: this.userProfile.user.email || '',
        address: this.userProfile.user.address || '',
        bio: ''
      });
    }
  }

  protected getInitials(): string {
    const name = this.userProfile?.user?.name || 'User';

    return name
      .split(' ')
      .map(n => n[0])
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
