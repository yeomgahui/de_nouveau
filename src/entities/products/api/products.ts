import { SaleStatus } from "@/shared/types/product";

export interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  quantity: number;
  color?: string;
  description?: string;
  wholesale_id: number;
  sale_status: SaleStatus; // is_visible 대신 sale_status 사용
  sizes?: Record<string, string>;
  main_image_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface ProductSearchFilters {
  category_id?: number;
  sale_status?: SaleStatus;
  price_min?: number;
  price_max?: number;
  brand?: string;
  search?: string;
}
