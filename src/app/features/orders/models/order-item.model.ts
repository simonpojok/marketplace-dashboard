export interface OrderItem {
  id: string;
  order?: string;
  product: string;
  variation?: string;
  product_name: string;
  product_sku: string;
  variation_details?: string;
  price: string;
  quantity: number;
  total_price: string;
}
