export interface AdminUser {
  id: string;
  phone_number: string;
  email: string;
  name: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  last_login_formatted: string;
  permissions_count: number;
  status: 'inactive' | 'superuser' | 'admin' | 'user';
}

export interface AdminUserDetail extends AdminUser {
  address?: string;
  is_verified: boolean;
  permissions: string[];
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  avatar: string | null;
  bio: string;
  date_of_birth: string | null;
  gender: string;
  secondary_phone: string;
  website: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  timezone: string;
  language: string;
  is_public: boolean;
  show_email: boolean;
  show_phone: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserRequest {
  phone_number: string;
  email: string;
  name: string;
  address?: string;
  password: string;
  password_confirm: string;
  is_staff: boolean;
  is_superuser: boolean;
  permissions?: string[];
}

export interface UpdateAdminUserRequest {
  email?: string;
  name?: string;
  address?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  permissions?: string[];
}

export interface ChangePasswordRequest {
  new_password: string;
  new_password_confirm: string;
}

export interface AdminUserSummary {
  total_admins: number;
  active_admins: number;
  superusers: number;
  inactive_admins: number;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
  summary: AdminUserSummary;
}

export interface Permission {
  id: number;
  codename: string;
  name: string;
}

export interface PermissionGroup {
  [model: string]: Permission[];
}

export interface ActivityLogEntry {
  user: AdminUser;
  action: 'login' | 'created' | 'updated' | 'activated' | 'deactivated';
  timestamp: string;
  description: string;
}

export interface ActivityLogResponse {
  recent_activity: ActivityLogEntry[];
}

// Enums for better type safety
export enum AdminUserStatus {
  INACTIVE = 'inactive',
  SUPERUSER = 'superuser',
  ADMIN = 'admin',
  USER = 'user'
}

export enum AdminUserAction {
  LOGIN = 'login',
  CREATED = 'created',
  UPDATED = 'updated',
  ACTIVATED = 'activated',
  DEACTIVATED = 'deactivated'
}
