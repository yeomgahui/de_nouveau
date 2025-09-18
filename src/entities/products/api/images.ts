import { getProductImageUrl } from "@/shared/lib/image-utils";

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string; // DB에서는 image_url 컬럼이지만 실제로는 파일명만 저장
  is_main: boolean;
  full_url?: string; // 계산된 전체 URL
}

/**
 * 상품의 모든 이미지를 가져옵니다
 */
export async function getProductImages(productId: number) {
  try {
    // 클라이언트에서는 상대 경로로 호출하여 환경변수 의존 제거
    const res = await fetch(`/api/products/${productId}/images`, {
      cache: "no-store",
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("이미지 조회 API 오류:", error);
    return {
      success: false,
      message: "서버 오류가 발생했습니다.",
      data: null,
    };
  }
}

/**
 * 상품의 메인 이미지만 가져옵니다
 */
export async function getMainProductImage(productId: number) {
  try {
    const result = await getProductImages(productId);
    if (!result.success || !result.data) return result;
    const main = result.data.find((i: any) => i.is_main) || result.data[0];
    if (!main) return { success: false, data: null, message: "이미지 없음" };
    return {
      success: true,
      data: main,
      message: "메인 이미지를 가져왔습니다.",
    };
  } catch (error) {
    console.error("메인 이미지 조회 API 오류:", error);
    return {
      success: false,
      message: "서버 오류가 발생했습니다.",
      data: null,
    };
  }
}
