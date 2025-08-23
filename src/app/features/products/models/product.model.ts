import {ProductVariation} from './product-variation.model';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  category_details?: Category;
  brand?: string;
  brand_details?: Brand;
  description: string;
  price: number;
  discount_price: number | null;
  current_price: number;
  discount_percentage: number;
  stock_quantity: number;
  primary_image: string;
  has_variations: boolean;
  is_active: boolean;
  is_featured: boolean;
  images: ProductImage[];
  variations: ProductVariation[];
  // TikTok integration fields
  tiktok_video_url?: string;
  has_tiktok_video?: boolean;
  tiktok_embed_id?: string;
  tiktok_embed_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  parent_details?: Category;
  image?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  products_count: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  is_active: boolean;
  products_count: number;
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}


export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
