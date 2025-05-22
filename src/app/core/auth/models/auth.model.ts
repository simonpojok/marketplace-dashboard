import {UserProfile} from './user-profile.model';

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface RegisterCredentials {
  phone_number: string;
  email?: string;
  name?: string;
  address?: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserProfile;
  message: string;
}
