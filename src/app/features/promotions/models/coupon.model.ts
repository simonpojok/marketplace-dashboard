export interface CouponListResponse {
  results: Array<Coupon>;
}

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

