import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  protected themeService = inject(ThemeService);

  // Reactive state with signals
  protected isLoading = signal(false);
  protected showPassword = signal(false);
  protected formSubmitted = signal(false);

  // Form group
  protected loginForm: FormGroup = this.fb.group({
    phone_number: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  protected togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('Successfully logged in');
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 401) {
          this.toastService.error('Invalid credentials. Please try again.');
        } else {
          this.toastService.error('An error occurred. Please try again later.');
        }

        console.error('Login error:', error);
      }
    });
  }
}
