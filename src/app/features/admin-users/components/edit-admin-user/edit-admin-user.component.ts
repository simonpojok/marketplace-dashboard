import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AdminUserService} from '../../services/admin-user.service';
import {ToastService} from '../../../../core/services/toast.service';
import {AdminUserDetail, UpdateAdminUserRequest, PermissionGroup} from '../../models/admin-user.model';

@Component({
  selector: 'app-edit-admin-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-admin-user.component.html',
  styles: []
})
export class EditAdminUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);

  // Reactive state
  protected user = signal<AdminUserDetail | null>(null);
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected permissions = signal<PermissionGroup>({});
  protected selectedPermissions = signal<Set<string>>(new Set());
  protected showAdvancedOptions = signal(false);

  protected editUserForm: FormGroup = this.fb.group({
    // Basic Information
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: [''],

    // Role and Permissions
    is_staff: [true, [Validators.required]],
    is_superuser: [false],
    is_active: [true],

    // Additional Options
    send_notification: [false],
    require_password_change: [false]
  });

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
      this.loadPermissions();
    }
  }

  private loadUser(userId: string): void {
    this.isLoading.set(true);

    this.adminUserService.getAdminUser(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.populateForm(user);
        this.selectedPermissions.set(new Set(user.permissions));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.toastService.error('Failed to load user details');
        this.isLoading.set(false);
        this.router.navigate(['/admin-users']);
      }
    });
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

  private populateForm(user: AdminUserDetail): void {
    this.editUserForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      is_active: user.is_active
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
      // Remove all from this group
      groupCodes.forEach(code => selected.delete(code));
    } else {
      // Add all from this group
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
    const isSuperuser = this.editUserForm.get('is_superuser')?.value;
    if (isSuperuser) {
      // Superusers don't need individual permissions
      this.selectedPermissions.set(new Set());
      this.editUserForm.get('is_staff')?.setValue(true);
    }
  }

  protected getFormErrors(fieldName: string): string[] {
    const field = this.editUserForm.get(fieldName);
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
    }

    return errors;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Full Name',
      email: 'Email',
      address: 'Address'
    };
    return displayNames[fieldName] || fieldName;
  }

  protected onSubmit(): void {
    if (this.editUserForm.invalid) {
      this.markFormGroupTouched(this.editUserForm);
      this.toastService.error('Please fix the errors in the form');
      return;
    }

    const user = this.user();
    if (!user) return;

    this.isSaving.set(true);

    const formValue = this.editUserForm.value;
    const updateRequest: UpdateAdminUserRequest = {
      name: formValue.name,
      email: formValue.email,
      address: formValue.address,
      is_staff: formValue.is_staff,
      is_superuser: formValue.is_superuser,
      is_active: formValue.is_active,
      permissions: Array.from(this.selectedPermissions())
    };

    this.adminUserService.updateAdminUser(user.id, updateRequest).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.router.navigate(['/admin-users', user.id]);
      },
      error: (error) => {
        console.error('Error updating admin user:', error);

        if (error.error && typeof error.error === 'object') {
          // Handle field-specific errors
          Object.keys(error.error).forEach(field => {
            const control = this.editUserForm.get(field);
            if (control) {
              control.setErrors({serverError: error.error[field]});
            }
          });
          this.toastService.error('Please fix the errors in the form');
        } else {
          this.toastService.error('Failed to update admin user');
        }

        this.isSaving.set(false);
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
    const user = this.user();
    if (user) {
      this.router.navigate(['/admin-users', user.id]);
    } else {
      this.router.navigate(['/admin-users']);
    }
  }

  protected getPermissionGroupKeys(): string[] {
    return Object.keys(this.permissions());
  }

  protected formatGroupName(groupName: string): string {
    return groupName.charAt(0).toUpperCase() + groupName.slice(1).replace(/_/g, ' ');
  }

  protected getStatusBadgeClass(user: AdminUserDetail): string {
    if (!user.is_active) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else if (user.is_superuser) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    } else if (user.is_staff) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  protected getStatusText(user: AdminUserDetail): string {
    if (!user.is_active) {
      return 'Inactive';
    } else if (user.is_superuser) {
      return 'Super User';
    } else if (user.is_staff) {
      return 'Admin';
    }
    return 'User';
  }

  getDateJoined() {
      return new Date(this.user()!.date_joined).toLocaleDateString();
  }

  // getDateLastLogin() {
  //   return new Date(this.user()!.last_login).toLocaleDateString();
  // }
}
