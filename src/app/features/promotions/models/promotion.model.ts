export interface PromotionListResponse {
  results: Promotion[];
}

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
