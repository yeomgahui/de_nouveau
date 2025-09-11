import { SaleStatus } from "@/shared/types/product";

export interface WholesaleProduct {
  id: number;
  name: string;
  supplier: string;
  price: number;
  quantity: number;
  brand: string;
  description?: string;
  order_number: string;
  purchase_date: string;
  sale_status?: SaleStatus; // 도매 상품도 판매 상태 추가
  created_at: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface WholesaleSearchFilters {
  brand?: string;
  startDate?: string;
  endDate?: string;
}

export async function getWholesaleProducts(
  filters?: WholesaleSearchFilters
): Promise<ApiResponse<WholesaleProduct[]>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const searchParams = new URLSearchParams();

    // 필터 파라미터 추가
    if (filters?.brand) {
      searchParams.append("brand", filters.brand);
    }
    if (filters?.startDate) {
      searchParams.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      searchParams.append("endDate", filters.endDate);
    }

    const url = `${baseUrl}/api/wholesale${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // 항상 최신 데이터 가져오기
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("도매 상품 목록 조회 실패:", error);
    return {
      success: false,
      message: "도매 상품 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}
