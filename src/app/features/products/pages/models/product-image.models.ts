export interface ProductImage {
  id?: string;
  file?: File;
  url?: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
  preview?: string;
}
