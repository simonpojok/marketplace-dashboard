export interface Customer {
  id: string;
  phone_number: string;
  email?: string;
  name?: string;
  address?: string;
  date_joined: string;
  orders_count?: number;
  total_spent?: number;
  last_order_date?: string;
}

export interface CustomerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  status_display?: string;
  created_at: string;
  grand_total: number;
  payment_status: boolean;
}

export interface CustomerOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomerOrder[];
}
