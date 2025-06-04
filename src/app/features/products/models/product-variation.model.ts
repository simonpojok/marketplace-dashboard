export interface ProductVariation {
  id?: string;
  sku: string;
  attributes: { [key: string]: string }; // Dynamic attributes like { color: 'red', size: 'M' }
  price_adjustment: number;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
}

export interface VariationAttribute {
  label: string;
  type: 'text' | 'select' | 'color-text' | 'number';
  options: string[];
  required?: boolean;
}

// Predefined attribute configurations
export const VARIATION_ATTRIBUTES: { [key: string]: VariationAttribute } = {
  // Apparel & Footwear
  size: {
    label: 'Size',
    type: 'select',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'Custom'],
    required: false
  },
  color: {
    label: 'Color',
    type: 'color-text',
    options: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray'],
    required: false
  },
  material: {
    label: 'Material',
    type: 'select',
    options: ['Cotton', 'Polyester', 'Silk', 'Wool', 'Denim', 'Leather', 'Canvas', 'Linen', 'Nylon', 'Spandex'],
    required: false
  },
  fit: {
    label: 'Fit',
    type: 'select',
    options: ['Slim', 'Regular', 'Loose', 'Skinny', 'Straight', 'Relaxed', 'Athletic'],
    required: false
  },
  pattern: {
    label: 'Pattern',
    type: 'select',
    options: ['Solid', 'Striped', 'Polka Dot', 'Floral', 'Geometric', 'Animal Print', 'Plaid'],
    required: false
  },

  // Electronics
  storage: {
    label: 'Storage',
    type: 'select',
    options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB'],
    required: false
  },
  ram: {
    label: 'RAM',
    type: 'select',
    options: ['1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'],
    required: false
  },
  screen_size: {
    label: 'Screen Size',
    type: 'select',
    options: ['4"', '5"', '5.5"', '6"', '6.1"', '6.5"', '6.7"', '13"', '14"', '15"', '17"', '21"', '24"', '27"', '32"', '43"', '55"', '65"', '75"'],
    required: false
  },
  processor: {
    label: 'Processor',
    type: 'text',
    options: [],
    required: false
  },
  operating_system: {
    label: 'Operating System',
    type: 'select',
    options: ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Chrome OS'],
    required: false
  },
  connectivity: {
    label: 'Connectivity',
    type: 'select',
    options: ['WiFi', '4G', '5G', 'Bluetooth', 'NFC', 'USB-C', 'Lightning'],
    required: false
  },

  // Home & Furniture
  dimensions: {
    label: 'Dimensions',
    type: 'text',
    options: [],
    required: false
  },
  finish: {
    label: 'Finish',
    type: 'select',
    options: ['Matte', 'Glossy', 'Satin', 'Natural', 'Painted', 'Stained', 'Lacquered'],
    required: false
  },
  style: {
    label: 'Style',
    type: 'select',
    options: ['Modern', 'Traditional', 'Contemporary', 'Rustic', 'Industrial', 'Minimalist'],
    required: false
  },

  // Kitchen Appliances
  capacity: {
    label: 'Capacity',
    type: 'text',
    options: [],
    required: false
  },
  power: {
    label: 'Power',
    type: 'text',
    options: [],
    required: false
  },
  voltage: {
    label: 'Voltage',
    type: 'select',
    options: ['110V', '220V', '240V'],
    required: false
  },

  // Beauty & Personal Care
  fragrance: {
    label: 'Fragrance',
    type: 'text',
    options: [],
    required: false
  },
  skin_type: {
    label: 'Skin Type',
    type: 'select',
    options: ['All', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Normal', 'Mature'],
    required: false
  },

  // Universal
  warranty: {
    label: 'Warranty',
    type: 'select',
    options: ['No Warranty', '3 Months', '6 Months', '1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'],
    required: false
  },
  brand_model: {
    label: 'Model',
    type: 'text',
    options: [],
    required: false
  },
  certification: {
    label: 'Certification',
    type: 'select',
    options: ['CE', 'FCC', 'ISO', 'ENERGY STAR', 'OEKO-TEX', 'Fair Trade'],
    required: false
  },
  custom: {
    label: 'Custom Attribute',
    type: 'text',
    options: [],
    required: false
  }
};

export interface VariationFormState {
  availableAttributes: string[];
  newVariation: Partial<ProductVariation>;
  selectedVariationIndex: number | null;
}
