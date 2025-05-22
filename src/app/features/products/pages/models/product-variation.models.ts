export interface ProductVariation {
  id?: string;
  sku: string;
  size: string;
  color: string;
  color_code: string;
  memory: string;
  storage: string;
  custom_attribute: string;
  price_adjustment: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
}
