import {CampaignStatus} from './campaign.model';
import {CouponType} from './coupon.model';
import {DiscountType} from './promotion.model';

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
