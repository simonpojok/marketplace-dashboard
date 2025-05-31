import {Component, OnInit, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {AdminUserService, AdminUserFilters} from '../../services/admin-user.service';
import {AdminUser, AdminUserSummary, AdminUserStatus} from '../../models/admin-user.model';
import {ToastService} from '../../../../core/services/toast.service';
import {ConfirmDialogService} from '../../../../core/services/confirm-dialog.service';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-users-list.component.html',
  styles: []
})
export class AdminUsersListComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private toastService = inject(ToastService);
  private confirmDialogService = inject(ConfirmDialogService);

  // Reactive state
  protected adminUsers = signal<AdminUser[]>([]);
  protected summary = signal<AdminUserSummary | null>(null);
  protected isLoading = signal(false);
  protected selectedUsers = signal<Set<string>>(new Set());

  // Pagination
  protected currentPage = signal(1);
  protected totalPages = signal(1);
  protected totalCount = signal(0);
  protected pageSize = signal(20);

  // Filters
  protected searchQuery = signal('');
  protected statusFilter = signal<string>('all');
  protected roleFilter = signal<string>('all');
  protected sortField = signal('-date_joined');

  // UI state
  protected showFilters = signal(false);
  protected showBulkActions = signal(false);

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  // Computed properties
  protected hasSelectedUsers = computed(() => this.selectedUsers().size > 0);
  protected allUsersSelected = computed(() =>
    this.adminUsers().length > 0 && this.selectedUsers().size === this.adminUsers().length
  );

  ngOnInit(): void {
    this.loadAdminUsers();
    this.setupSearchDebounce();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadAdminUsers();
    });
  }

  protected loadAdminUsers(): void {
    this.isLoading.set(true);

    const filters: AdminUserFilters = {
      page: this.currentPage(),
      page_size: this.pageSize(),
      ordering: this.sortField()
    };

    // Add search query
    if (this.searchQuery()) {
      filters.search = this.searchQuery();
    }

    // Add status filter
    if (this.statusFilter() !== 'all') {
      filters.is_active = this.statusFilter() === 'active';
    }

    // Add role filter
    if (this.roleFilter() === 'superuser') {
      filters.is_superuser = true;
    } else if (this.roleFilter() === 'admin') {
      filters.is_staff = true;
      filters.is_superuser = false;
    }

    this.adminUserService.getAdminUsers(filters).subscribe({
      next: (response) => {
        this.adminUsers.set(response.results);
        this.summary.set(response.summary);
        this.totalCount.set(response.count);
        this.totalPages.set(Math.ceil(response.count / this.pageSize()));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading admin users:', error);
        this.toastService.error('Failed to load admin users');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  protected onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadAdminUsers();
  }

  protected onRoleFilterChange(role: string): void {
    this.roleFilter.set(role);
    this.currentPage.set(1);
    this.loadAdminUsers();
  }

  protected onSortChange(field: string): void {
    // Toggle sort direction if same field
    if (this.sortField() === field) {
      this.sortField.set(`-${field}`);
    } else if (this.sortField() === `-${field}`) {
      this.sortField.set(field);
    } else {
      this.sortField.set(field);
    }

    this.currentPage.set(1);
    this.loadAdminUsers();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadAdminUsers();
  }

  protected toggleUserSelection(userId: string): void {
    const selected = new Set(this.selectedUsers());
    if (selected.has(userId)) {
      selected.delete(userId);
    } else {
      selected.add(userId);
    }
    this.selectedUsers.set(selected);
  }

  protected toggleAllUsers(): void {
    if (this.allUsersSelected()) {
      this.selectedUsers.set(new Set());
    } else {
      const allIds = new Set(this.adminUsers().map(user => user.id));
      this.selectedUsers.set(allIds);
    }
  }

  protected async deleteUser(user: AdminUser): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(
      'Deactivate Admin User',
      `Are you sure you want to deactivate ${user.name || user.phone_number}? They will not be able to access the admin panel.`,
      'Deactivate',
      'Cancel',
      'destructive'
    );

    if (!confirmed) return;

    this.adminUserService.deleteAdminUser(user.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadAdminUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.toastService.error('Failed to deactivate user');
      }
    });
  }

  protected async activateUser(user: AdminUser): Promise<void> {
    this.adminUserService.activateAdminUser(user.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadAdminUsers();
      },
      error: (error) => {
        console.error('Error activating user:', error);
        this.toastService.error('Failed to activate user');
      }
    });
  }

  protected async deactivateUser(user: AdminUser): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(
      'Deactivate Admin User',
      `Are you sure you want to deactivate ${user.name || user.phone_number}?`,
      'Deactivate',
      'Cancel',
      'destructive'
    );

    if (!confirmed) return;

    this.adminUserService.deactivateAdminUser(user.id).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.loadAdminUsers();
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
        this.toastService.error('Failed to deactivate user');
      }
    });
  }

  protected async bulkActivate(): Promise<void> {
    const userIds = Array.from(this.selectedUsers());

    this.adminUserService.bulkUpdateAdminUsers(userIds, 'activate').subscribe({
      next: (response) => {
        this.toastService.success(`${response.updated_count} users activated successfully`);
        this.selectedUsers.set(new Set());
        this.loadAdminUsers();
      },
      error: (error) => {
        console.error('Error in bulk activate:', error);
        this.toastService.error('Failed to activate selected users');
      }
    });
  }

  protected async bulkDeactivate(): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(
      'Bulk Deactivate',
      `Are you sure you want to deactivate ${this.selectedUsers().size} selected users?`,
      'Deactivate',
      'Cancel',
      'destructive'
    );

    if (!confirmed) return;

    const userIds = Array.from(this.selectedUsers());

    this.adminUserService.bulkUpdateAdminUsers(userIds, 'deactivate').subscribe({
      next: (response) => {
        this.toastService.success(`${response.updated_count} users deactivated successfully`);
        this.selectedUsers.set(new Set());
        this.loadAdminUsers();
      },
      error: (error) => {
        console.error('Error in bulk deactivate:', error);
        this.toastService.error('Failed to deactivate selected users');
      }
    });
  }

  protected getStatusBadgeClass(status: string): string {
    switch (status) {
      case AdminUserStatus.SUPERUSER:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case AdminUserStatus.ADMIN:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case AdminUserStatus.INACTIVE:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected exportUsers(): void {
    this.adminUserService.exportAdminUsers('csv').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-users-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Admin users exported successfully');
      },
      error: (error) => {
        console.error('Error exporting users:', error);
        this.toastService.error('Failed to export users');
      }
    });
  }

  protected readonly Math = Math;
}
