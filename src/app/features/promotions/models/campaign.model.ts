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

// src/app/features/promotions/models/promotion.model.ts
export interface Promotion {
  id: string;
  campaign: string;
  campaign_name: string;
  name: string;
  description: string;
  discount_type: DiscountType;
  discount_type_display: string;
  discount_value: number;
  max_discount_amount?: number;
  apply_to: ApplyTo;
  apply_to_display: string;
  products: string[];
  products_details: any[];
  categories: string[];
  categories_details: any[];
  brands: string[];
  brands_details: any[];
  buy_quantity?: number;
  get_quantity?: number;
  get_discount_percentage?: number;
  minimum_quantity?: number;
  minimum_amount?: number;
  priority: number;
  is_active: boolean;
  is_stackable: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export type DiscountType =
  | 'percentage'
  | 'fixed_amount'
  | 'buy_x_get_y'
  | 'free_shipping';

export type ApplyTo =
  | 'order'
  | 'products'
  | 'categories'
  | 'brands';

export interface PromotionCreateRequest {
  campaign: string;
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number;
  apply_to: ApplyTo;
  products?: string[];
  categories?: string[];
  brands?: string[];
  buy_quantity?: number;
  get_quantity?: number;
  get_discount_percentage?: number;
  minimum_quantity?: number;
  minimum_amount?: number;
  priority?: number;
  is_active?: boolean;
  is_stackable?: boolean;
}

// src/app/features/promotions/models/coupon.model.ts
export interface Coupon {
  id: string;
  campaign: string;
  campaign_name: string;
  code: string;
  coupon_type: CouponType;
  coupon_type_display: string;
  max_uses?: number;
  max_uses_per_user: number;
  specific_user?: string;
  specific_user_name?: string;
  is_active: boolean;
  usage_count: number;
  can_be_used: {
    can_use: boolean;
    message: string;
  };
  created_at: string;
  updated_at: string;
}

export type CouponType =
  | 'single_use'
  | 'multi_use'
  | 'user_specific';

export interface CouponCreateRequest {
  campaign: string;
  code?: string;
  coupon_type: CouponType;
  max_uses?: number;
  max_uses_per_user?: number;
  specific_user?: string;
  is_active?: boolean;
}

export interface CouponValidationRequest {
  code: string;
  order_total?: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  message: string;
  coupon?: {
    code: string;
    campaign_name: string;
    description?: string;
  };
  discount_preview?: {
    total_discount: number;
    applicable_promotions: any[];
  };
}

// src/app/features/promotions/models/promotion-usage.model.ts
export interface PromotionUsage {
  id: string;
  campaign: string;
  campaign_name: string;
  promotion?: string;
  promotion_name?: string;
  coupon?: string;
  coupon_code?: string;
  user: string;
  user_name: string;
  order: string;
  order_number: string;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  created_at: string;
}

export interface CampaignAnalytics {
  campaign: {
    id: string;
    name: string;
    status: CampaignStatus;
    start_date: string;
    end_date: string;
    total_usage_count: number;
    max_usage_total?: number;
    usage_percentage: number;
  };
  financial_impact: {
    total_discount_given: number;
    average_discount_per_order: number;
    total_orders_affected: number;
    average_order_value: number;
  };
  user_engagement: {
    unique_users: number;
    repeat_users: number;
  };
  promotion_breakdown: Array<{
    id: string;
    name: string;
    discount_type: DiscountType;
    total_discount: number;
    usage_count: number;
    is_active: boolean;
  }>;
  coupon_breakdown: Array<{
    id: string;
    code: string;
    coupon_type: CouponType;
    total_discount: number;
    usage_count: number;
    max_uses?: number;
    is_active: boolean;
  }>;
}
