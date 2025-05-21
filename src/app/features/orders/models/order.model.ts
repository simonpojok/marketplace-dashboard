export interface Order {
  id: string;
  order_number: string;
  user: string;
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  delivery_notes?: string;
  preferred_delivery_time: string;
  preferred_delivery_time_display?: string;
  status: OrderStatus;
  status_display?: string;
  payment_method: PaymentMethod;
  payment_method_display?: string;
  payment_status: boolean;
  total_price: number;
  shipping_cost: number;
  tax: number;
  grand_total: number;
  tracking_number?: string;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order: string;
  product: string;
  variation?: string;
  product_name: string;
  product_sku: string;
  variation_details?: string;
  price: number;
  quantity: number;
  total_price: number;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  status_display?: string;
  notes?: string;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'mtn_mobile_money' | 'airtel_money' | 'bank_transfer' | 'cash_on_delivery';

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export interface OrderFilterParams {
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  payment_status?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface OrderUpdateParams {
  status?: OrderStatus;
  tracking_number?: string;
  payment_status?: boolean;
  notes?: string;
}
