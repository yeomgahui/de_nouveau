// 제품 판매 상태 타입 정의
export type SaleStatus = "SELLING" | "SOLD_OUT" | "HIDDEN";

// 판매 상태별 라벨 매핑
export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  SELLING: "판매중",
  SOLD_OUT: "품절",
  HIDDEN: "숨김",
};

// 판매 상태별 색상 클래스
export const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  SELLING: "text-green-600 bg-green-50",
  SOLD_OUT: "text-orange-600 bg-orange-50",
  HIDDEN: "text-gray-600 bg-gray-50",
};

// 기존 is_visible을 sale_status로 변환하는 헬퍼 함수
export function isVisibleToSaleStatus(isVisible: boolean): SaleStatus {
  return isVisible ? "SELLING" : "HIDDEN";
}

// sale_status를 is_visible로 변환하는 헬퍼 함수 (호환성 유지)
export function saleStatusToIsVisible(saleStatus: SaleStatus): boolean {
  return saleStatus !== "HIDDEN";
}

// 사용자에게 노출되는지 확인하는 함수
export function isVisibleToUsers(saleStatus: SaleStatus): boolean {
  return saleStatus === "SELLING" || saleStatus === "SOLD_OUT";
}

// 구매 가능한지 확인하는 함수
export function isPurchasable(saleStatus: SaleStatus): boolean {
  return saleStatus === "SELLING";
}
