import {Coupon} from './coupon.model';
import {Promotion} from './promotion.model';

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  campaign_type: CampaignType;
  campaign_type_display: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  status_display: string;
  is_featured: boolean;
  priority: number;
  max_usage_total?: number;
  max_usage_per_user?: number;
  target_new_customers_only: boolean;
  minimum_order_amount?: number;
  banner_image?: string;
  banner_image_url?: string;
  banner_text?: string;
  total_usage_count: number;
  usage_percentage: number;
  is_active: boolean;
  is_upcoming: boolean;
  is_expired: boolean;
  promotions?: Promotion[];
  coupons?: Coupon[];
  promotions_count: number;
  coupons_count: number;
  created_at: string;
  updated_at: string;
}

export type CampaignType =
  | 'flash_sale'
  | 'seasonal'
  | 'clearance'
  | 'new_customer'
  | 'loyalty'
  | 'bulk_discount'
  | 'general';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface CampaignListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Campaign[];
}

export interface CampaignCreateRequest {
  name: string;
  description?: string;
  campaign_type: CampaignType;
  start_date: string;
  end_date: string;
  is_featured?: boolean;
  priority?: number;
  max_usage_total?: number;
  max_usage_per_user?: number;
  target_new_customers_only?: boolean;
  minimum_order_amount?: number;
  banner_image?: File;
  banner_text?: string;
}

export interface CampaignFilterParams {
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  is_featured?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

