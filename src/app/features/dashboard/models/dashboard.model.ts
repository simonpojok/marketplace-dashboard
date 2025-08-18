export interface DashboardSummary {
  totalSales: number;
  salesChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
}

export interface SalesTrendData {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  quantity: number;
  performance: number; // percentage growth
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  salesTrend: SalesTrendData[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  topCustomers: TopCustomer[];
}
