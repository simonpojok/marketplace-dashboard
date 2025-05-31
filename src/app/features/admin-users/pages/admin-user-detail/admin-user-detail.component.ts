import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AdminUserService} from '../../services/admin-user.service';
import {AdminUserDetail, ChangePasswordRequest} from '../../models/admin-user.model';
import {ToastService} from '../../../../core/services/toast.service';
import {ConfirmDialogService} from '../../../../core/services/confirm-dialog.service';
import {ChangePasswordModalComponent} from '../change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ChangePasswordModalComponent],
  templateUrl: './admin-user-detail.component.html',
  styles: []
})
export class AdminUserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);
  private confirmDialogService = inject(ConfirmDialogService);

  protected user = signal<AdminUserDetail | null>(null);
  protected isLoading = signal(true);
  protected showChangePasswordModal = signal(false);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  private loadUser(userId: string): void {
    this.isLoading.set(true);

    this.adminUserService.getAdminUser(userId).subscribe({
      next: (user) => {
        this.user.set(user);
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

  protected async activateUser(): Promise<void> {
    const user = this.user();
    if (!user) return;

    this.adminUserService.activateAdminUser(user.id).subscribe({
      next: (response) => {
        this.toastService.error(response.message);
        this.loadUser(user.id); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error activating user:', error);
        this.toastService.error('Failed to activate user');
      }
    });
  }

  protected async deactivateUser(): Promise<void> {
    const user = this.user();
    if (!user) return;

    const confirmed = await this.confirmDialogService.confirm(
      'Deactivate Admin User',
      `Are you sure you want to deactivate ${user.name || user.phone_number}? They will not be able to access the admin panel.`,
      'Deactivate',
      'Cancel',
      'destructive'
    );

    if (!confirmed) return;

    this.adminUserService.deactivateAdminUser(user.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadUser(user.id); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
        this.toastService.error('Failed to deactivate user');
      }
    });
  }

  protected async deleteUser(): Promise<void> {
    const user = this.user();
    if (!user) return;

    const confirmed = await this.confirmDialogService.confirm(
      'Delete Admin User',
      `Are you sure you want to delete ${user.name || user.phone_number}? This action cannot be undone.`,
      'Delete',
      'Cancel',
      'destructive'
    );

    if (!confirmed) return;

    this.adminUserService.deleteAdminUser(user.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.router.navigate(['/admin-users']);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.toastService.error('Failed to delete user');
      }
    });
  }

  protected openChangePasswordModal(): void {
    this.showChangePasswordModal.set(true);
  }

  protected onPasswordChanged(passwordData: ChangePasswordRequest): void {
    const user = this.user();
    if (!user) return;

    this.adminUserService.changePassword(user.id, passwordData).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.showChangePasswordModal.set(false);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.toastService.error('Failed to change password');
      }
    });
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

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatPermissions(permissions: string[]): string {
    if (!permissions || permissions.length === 0) {
      return 'No specific permissions';
    }
    return permissions.map(p => p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
  }

  protected readonly Boolean = Boolean;
}
