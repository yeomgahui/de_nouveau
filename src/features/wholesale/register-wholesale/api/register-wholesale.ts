"use server";

interface FormState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function registerWholesaleProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 폼 데이터 추출
  const name = formData.get("name") as string;
  const supplier = formData.get("supplier") as string;
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  const brand = formData.get("brand") as string;
  const order = Number(formData.get("order"));
  const description = formData.get("description") as string;
  const purchase_date = formData.get("purchase_date") as string;

  // 검증
  const errors: Record<string, string> = {};

  if (!price || price <= 0) {
    errors.price = "가격은 0보다 커야 합니다.";
  }

  if (!quantity || quantity <= 0) {
    errors.quantity = "수량은 0보다 커야 합니다.";
  }

  if (order && order <= 0) {
    errors.order = "순번은 0보다 커야 합니다.";
  }

  if (purchase_date) {
    const purchaseDate = new Date(purchase_date);
    if (isNaN(purchaseDate.getTime())) {
      errors.purchase_date = "올바른 날짜 형식이 아닙니다.";
    }
  }

  // 에러가 있으면 반환
  if (Object.keys(errors).length > 0) {
    console.log(errors);
    return {
      success: false,
      message: "입력 정보를 확인해주세요.",
      errors,
    };
  }

  try {
    const productData = {
      name: name.trim(),
      supplier: supplier.trim(),
      price,
      quantity,
      brand: brand.trim(),
      order,
      description: description?.trim() || null,
      purchase_date: purchase_date || null,
      created_at: new Date().toISOString(),
    };

    // API 라우트 호출
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/wholesale/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
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
