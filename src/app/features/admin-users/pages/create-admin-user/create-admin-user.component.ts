import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUserService } from '../../services/admin-user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreateAdminUserRequest, PermissionGroup } from '../../models/admin-user.model';

@Component({
  selector: 'app-create-admin-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-admin-user.component.html',
  styles: []
})
export class CreateAdminUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);

  protected isLoading = signal(false);
  protected permissions = signal<PermissionGroup>({});
  protected selectedPermissions = signal<Set<string>>(new Set());
  protected showAdvancedOptions = signal(false);

  protected createUserForm: FormGroup = this.fb.group({
    // Basic Information
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required, Validators.pattern(/^\+256[7][0-9]{8}$/)]],
    address: [''],

    // Password
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirm: ['', [Validators.required]],

    // Role and Permissions
    is_staff: [true, [Validators.required]],
    is_superuser: [false],

    // Additional Options
    send_welcome_email: [true],
    require_password_change: [false]
  }, {
    validators: this.passwordMatchValidator
  });

  ngOnInit(): void {
    this.loadPermissions();
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirm');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  private loadPermissions(): void {
    this.adminUserService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions.set(permissions);
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.toastService.error('Failed to load permissions');
      }
    });
  }

  protected togglePermission(permission: string): void {
    const selected = new Set(this.selectedPermissions());
    if (selected.has(permission)) {
      selected.delete(permission);
    } else {
      selected.add(permission);
    }
    this.selectedPermissions.set(selected);
  }

  protected toggleAllPermissionsInGroup(groupPermissions: any[]): void {
    const selected = new Set(this.selectedPermissions());
    const groupCodes = groupPermissions.map(p => p.codename);
    const allSelected = groupCodes.every(code => selected.has(code));

    if (allSelected) {
      groupCodes.forEach(code => selected.delete(code));
    } else {
      groupCodes.forEach(code => selected.add(code));
    }

    this.selectedPermissions.set(selected);
  }

  protected isPermissionSelected(permission: string): boolean {
    return this.selectedPermissions().has(permission);
  }

  protected isGroupFullySelected(groupPermissions: any[]): boolean {
    const groupCodes = groupPermissions.map(p => p.codename);
    return groupCodes.every(code => this.selectedPermissions().has(code));
  }

  protected isGroupPartiallySelected(groupPermissions: any[]): boolean {
    const groupCodes = groupPermissions.map(p => p.codename);
    const selectedCount = groupCodes.filter(code => this.selectedPermissions().has(code)).length;
    return selectedCount > 0 && selectedCount < groupCodes.length;
  }

  protected onSuperuserChange(): void {
    const isSuperuser = this.createUserForm.get('is_superuser')?.value;
    if (isSuperuser) {
      this.selectedPermissions.set(new Set());
      this.createUserForm.get('is_staff')?.setValue(true);
    }
  }

  protected getFormErrors(fieldName: string): string[] {
    const field = this.createUserForm.get(fieldName);
    const errors: string[] = [];

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        errors.push(`${this.getFieldDisplayName(fieldName)} is required`);
      }
      if (field.errors['email']) {
        errors.push('Please enter a valid email address');
      }
      if (field.errors['minlength']) {
        errors.push(`${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`);
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone_number') {
          errors.push('Please enter a valid Ugandan phone number (e.g., +256771234567)');
        }
      }
      if (field.errors['passwordMismatch']) {
        errors.push('Passwords do not match');
      }
    }

    return errors;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Full Name',
      email: 'Email',
      phone_number: 'Phone Number',
      password: 'Password',
      password_confirm: 'Confirm Password',
      address: 'Address'
    };
    return displayNames[fieldName] || fieldName;
  }

  protected formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    if (value.startsWith('256')) {
      value = '+' + value;
    } else if (value.startsWith('0')) {
      value = '+256' + value.substring(1);
    } else if (!value.startsWith('+256')) {
      value = '+256' + value;
    }

    if (value.length > 13) {
      value = value.substring(0, 13);
    }

    this.createUserForm.get('phone_number')?.setValue(value);
  }

  protected onSubmit(): void {
    if (this.createUserForm.invalid) {
      this.markFormGroupTouched(this.createUserForm);
      this.toastService.success('Please fix the errors in the form');
      return;
    }

    this.isLoading.set(true);

    const formValue = this.createUserForm.value;
    const createRequest: CreateAdminUserRequest = {
      name: formValue.name,
      email: formValue.email,
      phone_number: formValue.phone_number,
      address: formValue.address,
      password: formValue.password,
      password_confirm: formValue.password_confirm,
      is_staff: formValue.is_staff,
      is_superuser: formValue.is_superuser,
      permissions: Array.from(this.selectedPermissions())
    };

    this.adminUserService.createAdminUser(createRequest).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.router.navigate(['/admin-users', response.user.id]);
      },
      error: (error) => {
        console.error('Error creating admin user:', error);

        if (error.error && typeof error.error === 'object') {
          Object.keys(error.error).forEach(field => {
            const control = this.createUserForm.get(field);
            if (control) {
              control.setErrors({ serverError: error.error[field] });
            }
          });
          this.toastService.error('Please fix the errors in the form');
        } else {
          this.toastService.error('Failed to create admin user');
        }

        this.isLoading.set(false);
      }
    });
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
    this.router.navigate(['/admin-users']);
  }

  protected getPermissionGroupKeys(): string[] {
    return Object.keys(this.permissions());
  }

  protected formatGroupName(groupName: string): string {
    return groupName.charAt(0).toUpperCase() + groupName.slice(1).replace(/_/g, ' ');
  }
}
