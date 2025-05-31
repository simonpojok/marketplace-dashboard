import {Routes} from '@angular/router';
import {AdminUsersListComponent} from './pages/admin-users-list/admin-users-list.component';
import {CreateAdminUserComponent} from './pages/create-admin-user/create-admin-user.component';
import {AdminUserDetailComponent} from './pages/admin-user-detail/admin-user-detail.component';
import {EditAdminUserComponent} from './pages/edit-admin-user/edit-admin-user.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminUsersListComponent,
    data: {title: 'Admin Users'}
  },
  {
    path: 'create',
    component: CreateAdminUserComponent,
    data: {title: 'Create Admin User'}
  },
  {
    path: ':id',
    component: AdminUserDetailComponent,
    data: {title: 'Admin User Details'}
  },
  {
    path: ':id/edit',
    component: EditAdminUserComponent,
    data: {title: 'Edit Admin User'}
  }
];

