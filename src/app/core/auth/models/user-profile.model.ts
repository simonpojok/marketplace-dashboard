import {User} from './user.model';

export interface UserProfile {
  id: string;
  user: User;
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
  age: number | null;
  full_address: string;
  display_name: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
