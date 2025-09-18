import { SaleStatus } from "@/shared/types/product";

export interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  quantity: number;
  color?: string[] | null;
  description?: string;
  wholesale_id: number;
  sale_status: SaleStatus; // is_visible 대신 sale_status 사용
  sizes?: Record<string, string>;
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

// 제품 목록 조회 API 호출 함수
export async function getProducts(
  filters?: ProductSearchFilters
): Promise<ApiResponse<Product[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const params = new URLSearchParams();

    if (filters?.category_id)
      params.append("category_id", String(filters.category_id));
    if (filters?.sale_status) params.append("sale_status", filters.sale_status);
    if (filters?.price_min)
      params.append("price_min", String(filters.price_min));
    if (filters?.price_max)
      params.append("price_max", String(filters.price_max));
    if (filters?.search && filters.search.trim() !== "")
      params.append("search", filters.search.trim());

    const url = `${baseUrl}/api/products${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("제품 목록 조회 실패:", error);
    return {
      success: false,
      message: "제품 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

// 제품 상세 조회 API 호출 함수
export async function getProductById(
  id: number
): Promise<ApiResponse<Product>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/products/${id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("제품 상세 조회 실패:", error);
    return {
      success: false,
      message: "제품 상세를 불러오는 중 오류가 발생했습니다.",
    };
  }
}
