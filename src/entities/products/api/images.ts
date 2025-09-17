import { supabaseAdmin } from "@/shared/lib/supabase";
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
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("is_main", { ascending: false }); // 메인 이미지를 먼저

    if (error) {
      console.error("이미지 조회 오류:", error);
      return {
        success: false,
        message: "이미지 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }

    // 각 이미지에 전체 URL 추가
    const imagesWithUrls = (data || []).map((image) => ({
      ...image,
      full_url: getProductImageUrl(image.product_id, image.image_url),
    }));

    return {
      success: true,
      data: imagesWithUrls,
      message: `${imagesWithUrls.length}개의 이미지를 가져왔습니다.`,
    };
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
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .eq("is_main", true)
      .single();

    if (error) {
      console.error("메인 이미지 조회 오류:", error);
      return {
        success: false,
        message: "메인 이미지 조회 중 오류가 발생했습니다.",
        data: null,
      };
    }

    // 전체 URL 추가
    const imageWithUrl = {
      ...data,
      full_url: getProductImageUrl(data.product_id, data.image_url),
    };

    return {
      success: true,
      data: imageWithUrl,
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
