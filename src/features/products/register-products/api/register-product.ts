"use server";

import { SaleStatus } from "@/shared/types/product";

interface FormState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function registerProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 폼 데이터 추출
  const name = formData.get("name") as string;
  const category_id = Number(formData.get("category_id"));
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  const color = formData.get("color") as string;
  const description = formData.get("description") as string;
  const wholesale_id = Number(formData.get("wholesale_id"));
  const sale_status = formData.get("sale_status") as SaleStatus;

  // 사이즈 데이터 처리
  const sizesData = formData.get("sizes") as string;
  let sizes: Record<string, string> = {};
  if (sizesData) {
    try {
      sizes = JSON.parse(sizesData);
    } catch (error) {
      console.error("사이즈 데이터 파싱 오류:", error);
    }
  }

  // 검증
  const errors: Record<string, string> = {};

  if (!name?.trim()) {
    errors.name = "상품명을 입력해주세요.";
  }

  if (!category_id || category_id <= 0) {
    errors.category_id = "카테고리를 선택해주세요.";
  }

  if (!price || price <= 0) {
    errors.price = "가격은 0보다 커야 합니다.";
  }

  if (!quantity || quantity <= 0) {
    errors.quantity = "수량은 0보다 커야 합니다.";
  }

  if (!wholesale_id || wholesale_id <= 0) {
    errors.wholesale_id = "도매 상품을 선택해주세요.";
  }

  // 이미지 파일 검증
  const imageFiles = formData.getAll("images") as File[];
  const validImages = imageFiles.filter((file) => file.size > 0);

  if (validImages.length === 0) {
    errors.images = "상품 사진을 최소 1장 이상 업로드해주세요.";
  }

  // 사이즈가 입력된 경우에만 검증
  if (Object.keys(sizes).length > 0) {
    const hasEmptySize = Object.entries(sizes).some(
      ([key, value]) => !key.trim() || !value.trim()
    );
    if (hasEmptySize) {
      errors.sizes = "사이즈를 입력하신 경우 모든 항목과 값을 입력해주세요.";
    }
  }

  // 에러가 있으면 반환
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "입력 정보를 확인해주세요.",
      errors,
    };
  }

  try {
    // FormData 생성 (파일 업로드를 위해)
    const uploadFormData = new FormData();

    // 기본 데이터 추가
    uploadFormData.append("name", name.trim());
    uploadFormData.append("category_id", category_id.toString());
    uploadFormData.append("price", price.toString());
    uploadFormData.append("quantity", quantity.toString());
    uploadFormData.append("color", color?.trim() || "");
    uploadFormData.append("description", description?.trim() || "");
    uploadFormData.append("wholesale_id", wholesale_id.toString());
    uploadFormData.append("sale_status", sale_status);
    uploadFormData.append(
      "main_image_index",
      (Number(formData.get("main_image_index")) || 0).toString()
    );

    // 사이즈 데이터 추가
    if (Object.keys(sizes).length > 0) {
      uploadFormData.append("sizes", JSON.stringify(sizes));
    }

    // 이미지 파일들 추가
    validImages.forEach((file) => {
      uploadFormData.append("images", file);
    });

    // API 라우트 호출
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/products/register`,
      {
        method: "POST",
        body: uploadFormData, // FormData 전송 (Content-Type 헤더 제거)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "요청 처리 중 오류가 발생했습니다.",
        errors: result.errors,
      };
    }

    return {
      success: true,
      message: "상품이 성공적으로 등록되었습니다!",
    };
  } catch (error) {
    console.error("상품 등록 실패:", error);
    return {
      success: false,
      message: "상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}
