import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {ToastService} from '../../../core/services/toast.service';
import {ThemeService} from '../../../core/services/theme.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styles: []
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  protected themeService = inject(ThemeService);

  // Reactive state with signals
  protected isLoading = signal(false);
  protected formSubmitted = signal(false);
  protected resetSuccess = signal(false);
  protected showPassword = signal(false);

  // Form group with password match validation
  protected resetForm: FormGroup = this.fb.group({
    phone_number: ['', [Validators.required]],
    verification_code: ['', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    new_password_confirm: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  constructor() {
    // Check if phone number was passed in query params
    this.route.queryParams.subscribe(params => {
      if (params['phone_number']) {
        this.resetForm.patchValue({
          phone_number: params['phone_number']
        });
      }
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    // Prepare data for API
    const resetData = {
      phone_number: this.resetForm.value.phone_number,
      verification_code: this.resetForm.value.verification_code,
      new_password: this.resetForm.value.new_password,
      new_password_confirm: this.resetForm.value.new_password_confirm
    };

    // API call to confirm password reset
    const apiUrl = `${environment.apiUrl}${environment.apiVersion}/users/password/reset/confirm/`;
    this.http.post(apiUrl, resetData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.resetSuccess.set(true);
        this.toastService.success('Password reset successfully');
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 400) {
          if (error.error?.verification_code) {
            this.toastService.error('Invalid verification code');
          } else if (error.error?.phone_number) {
            this.toastService.error('Invalid phone number');
          } else if (error.error?.new_password) {
            this.toastService.error(error.error.new_password[0]);
          } else {
            this.toastService.error('Invalid input data');
          }
        } else {
          this.toastService.error('An error occurred. Please try again later.');
        }

        console.error('Password reset error:', error);
      }
    });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('new_password_confirm')?.value;

    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? {'passwordMismatch': true}
      : null;
  }
}
