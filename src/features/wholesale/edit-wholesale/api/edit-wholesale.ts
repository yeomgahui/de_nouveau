"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/shared/lib/supabase";

interface FormState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function getWholesaleProduct(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("wholesale_products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("도매 상품 조회 실패:", error);
      return {
        success: false,
        message: "상품 정보를 불러오는 중 오류가 발생했습니다.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("도매 상품 조회 오류:", error);
    return {
      success: false,
      message: "상품 정보를 불러오는 중 오류가 발생했습니다.",
    };
  }
}

export async function updateWholesaleProduct(
  productId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const supplier = formData.get("supplier") as string;
  const brand = formData.get("brand") as string;
  const priceStr = formData.get("price") as string;
  const quantityStr = formData.get("quantity") as string;
  const description = formData.get("description") as string;
  const orderNumber = formData.get("order_number") as string;
  const purchaseDate = formData.get("purchase_date") as string;

  // 기본 유효성 검사
  const errors: Record<string, string> = {};

  if (!name?.trim()) {
    errors.name = "상품명을 입력해주세요.";
  }

  if (!supplier?.trim()) {
    errors.supplier = "도매 거래처를 입력해주세요.";
  }

  if (!orderNumber?.trim()) {
    errors.order_number = "사입 번호를 입력해주세요.";
  }

  if (!purchaseDate?.trim()) {
    errors.purchase_date = "사입 날짜를 입력해주세요.";
  } else {
    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(purchaseDate)) {
      errors.purchase_date = "올바른 날짜 형식을 입력해주세요.";
    }
  }

  if (!priceStr?.trim()) {
    errors.price = "가격을 입력해주세요.";
  } else {
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      errors.price = "올바른 가격을 입력해주세요.";
    }
  }

  if (!quantityStr?.trim()) {
    errors.quantity = "수량을 입력해주세요.";
  } else {
    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      errors.quantity = "올바른 수량을 입력해주세요.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "입력한 정보를 다시 확인해주세요.",
      errors,
    };
  }

  try {
    const price = parseFloat(priceStr);
    const quantity = parseInt(quantityStr);

    // Supabase에 데이터 업데이트
    const { error } = await supabaseAdmin
      .from("wholesale_products")
      .update({
        name: name.trim(),
        supplier: supplier.trim(),
        brand: brand?.trim() || null,
        price,
        quantity,
        description: description?.trim() || null,
        order_number: orderNumber.trim(),
        purchase_date: purchaseDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      console.error("도매 상품 수정 실패:", error);
      return {
        success: false,
        message: "상품 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
      };
    }

    // 캐시 무효화 및 리다이렉트
    revalidatePath("/admin/wholesale/list");
    redirect("/admin/wholesale/list");
  } catch (error) {
    console.error("도매 상품 수정 오류:", error);
    return {
      success: false,
      message: "상품 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}
