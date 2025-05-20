import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {ToastService} from '../../../core/services/toast.service';
import {ThemeService} from '../../../core/services/theme.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styles: []
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  protected themeService = inject(ThemeService);

  // Reactive state with signals
  protected isLoading = signal(false);
  protected formSubmitted = signal(false);
  protected submitted = signal(false);

  // Form group
  protected resetForm: FormGroup = this.fb.group({
    phone_number: ['', [Validators.required]]
  });

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    // API call to request password reset
    const apiUrl = `${environment.apiUrl}${environment.apiVersion}/users/password/reset/`;
    this.http.post(apiUrl, this.resetForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
      },
      error: (error) => {
        this.isLoading.set(false);

        // We don't reveal if the phone number exists or not for security
        // so we show the success message even on error
        this.submitted.set(true);

        console.error('Password reset request error:', error);
      }
    });
  }
}
