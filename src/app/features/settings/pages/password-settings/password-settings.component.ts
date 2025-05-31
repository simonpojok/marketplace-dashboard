import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ToastService} from '../../../../core/services/toast.service';
import {ChangePasswordRequest, UserService} from '../../../../core/services/user.service';

@Component({
  selector: 'app-password-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'password-settings.component.html',
  styles: []
})
export class PasswordSettingsComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isSubmitting = signal(false);
  protected showCurrentPassword = signal(false);
  protected showNewPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected submitted = false;

  // Form group with password match validation
  protected passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });

  protected toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update(value => !value);
  }

  protected toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(value => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  protected onSubmit(): void {
    this.submitted = true;

    if (this.passwordForm.invalid) {
      this.toastService.warning('Please fill in all fields correctly');
      return;
    }

    this.isSubmitting.set(true);

    // Prepare data for API
    const formData: ChangePasswordRequest = {
      old_password: this.passwordForm.value.current_password!,
      new_password: this.passwordForm.value.new_password!,
      new_password_confirm: this.passwordForm.value.confirm_password!
    };

    this.userService.changePassword(formData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.toastService.success('Password changed successfully');
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.handlePasswordChangeError(error);
      }
    });
  }

  private handlePasswordChangeError(error: any): void {
    console.error('Error changing password:', error);

    if (error.status === 400) {
      // Handle validation errors
      const errors = error.error;

      if (errors.old_password) {
        this.toastService.error(`Current password: ${errors.old_password[0]}`);
      } else if (errors.new_password) {
        this.toastService.error(`New password: ${errors.new_password[0]}`);
      } else if (errors.message) {
        this.toastService.error(errors.message);
      } else {
        this.toastService.error('Failed to change password');
      }
    } else if (error.status === 401) {
      this.toastService.error('Current password is incorrect');
    } else {
      this.toastService.error('An error occurred. Please try again later.');
    }
  }

  protected resetForm(): void {
    this.submitted = false;
    this.passwordForm.reset();
  }

  protected getPasswordStrength(): number {
    const password = this.passwordForm.get('new_password')?.value || '';

    if (!password) {
      return 0;
    }

    let strength = 0;

    // Length
    if (password.length >= 8) {
      strength += 20;
    }

    // Uppercase
    if (/[A-Z]/.test(password)) {
      strength += 20;
    }

    // Lowercase
    if (/[a-z]/.test(password)) {
      strength += 20;
    }

    // Numbers
    if (/[0-9]/.test(password)) {
      strength += 20;
    }

    // Special characters
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 20;
    }

    return strength;
  }

  protected getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();

    if (strength < 20) {
      return 'Very Weak';
    } else if (strength < 40) {
      return 'Weak';
    } else if (strength < 60) {
      return 'Medium';
    } else if (strength < 80) {
      return 'Strong';
    } else {
      return 'Very Strong';
    }
  }

  protected getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();

    if (strength < 20) {
      return 'text-red-600 dark:text-red-400';
    } else if (strength < 40) {
      return 'text-orange-600 dark:text-orange-400';
    } else if (strength < 60) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else if (strength < 80) {
      return 'text-blue-600 dark:text-blue-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  }

  protected getPasswordStrengthBarClass(): string {
    const strength = this.getPasswordStrength();

    if (strength < 20) {
      return 'bg-red-500';
    } else if (strength < 40) {
      return 'bg-orange-500';
    } else if (strength < 60) {
      return 'bg-yellow-500';
    } else if (strength < 80) {
      return 'bg-blue-500';
    } else {
      return 'bg-green-500';
    }
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;

    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? {'passwordMismatch': true}
      : null;
  }
}
