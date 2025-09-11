import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      supplier,
      price,
      quantity,
      brand,
      order,
      description,
      purchase_date,
    } = body;

    // 검증
    const errors: Record<string, string> = {};

    if (!price || price <= 0) {
      errors.price = "가격은 0보다 커야 합니다.";
    }

    if (!quantity || quantity <= 0) {
      errors.quantity = "수량은 0보다 커야 합니다.";
    }

    if (purchase_date) {
      const purchaseDate = new Date(purchase_date);
      if (isNaN(purchaseDate.getTime())) {
        errors.purchase_date = "올바른 날짜 형식이 아닙니다.";
      }
    }

    // 에러가 있으면 반환
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "입력 정보를 확인해주세요.",
          errors,
        },
        { status: 400 }
      );
    }

    const productData = {
      name: name.trim(),
      supplier: supplier.trim(),
      price,
      quantity,
      brand: brand.trim(),
      order_number: order,
      description: description?.trim() || null,
      purchase_date: purchase_date || null,
      created_at: new Date().toISOString(),
    };

    // Supabase에 데이터 저장 (관리자 권한으로)
    const { data, error } = await supabaseAdmin
      .from("wholesale_products")
      .insert([productData])
      .select();

    if (error) {
      console.error("Supabase 저장 실패:", error);
      return NextResponse.json(
        {
          success: false,
          message:
            "데이터베이스 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
        },
        { status: 500 }
      );
    }

    console.log("도매 상품 등록 성공:", data);

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: "상품이 성공적으로 등록되었습니다!",
      data,
    });
  } catch (error) {
    console.error("상품 등록 실패:", error);
    return NextResponse.json(
      {
        success: false,
        message: "상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
