import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangePasswordRequest } from '../../models/admin-user.model';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-modal.component.html',
  styles: []
})
export class ChangePasswordModalComponent {
  @Input() isOpen = false;
  @Output() passwordChanged = new EventEmitter<ChangePasswordRequest>();
  @Output() modalClosed = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  protected isSubmitting = signal(false);
  protected showPasswords = signal(false);

  protected passwordForm: FormGroup = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    new_password_confirm: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('new_password');
    const confirmPassword = form.get('new_password_confirm');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  protected getFormErrors(fieldName: string): string[] {
    const field = this.passwordForm.get(fieldName);
    const errors: string[] = [];

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        errors.push(`${this.getFieldDisplayName(fieldName)} is required`);
      }
      if (field.errors['minlength']) {
        errors.push(`${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`);
      }
      if (field.errors['passwordMismatch']) {
        errors.push('Passwords do not match');
      }
    }

    return errors;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      new_password: 'New Password',
      new_password_confirm: 'Confirm Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  protected onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.passwordForm.value;
    const passwordData: ChangePasswordRequest = {
      new_password: formValue.new_password,
      new_password_confirm: formValue.new_password_confirm
    };

    this.passwordChanged.emit(passwordData);
    this.isSubmitting.set(false);
    this.passwordForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  protected onCancel(): void {
    this.passwordForm.reset();
    this.modalClosed.emit();
  }

  protected onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPasswords.set(!this.showPasswords());
  }
}
