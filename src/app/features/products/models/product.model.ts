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
    has_variations: boolean;
    is_active: boolean;
    is_featured: boolean;
    images: ProductImage[];
    variations: ProductVariation[];
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
    children?: Category[];
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    is_active: boolean;
}

export interface ProductImage {
    id: string;
    image: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
}

export interface ProductVariation {
    id: string;
    sku: string;
    size?: string;
    size_display?: string;
    color?: string;
    color_code?: string;
    custom_attribute?: string;
    price_adjustment: number;
    stock_quantity: number;
    image?: string;
    is_active: boolean;
    final_price: number;
}

export interface ProductListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
}
