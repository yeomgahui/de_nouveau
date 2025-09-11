import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Supabase에서 도매 상품 목록 조회
    let query = supabaseAdmin
      .from("wholesale_products")
      .select(
        "id, name, supplier, price, quantity, brand, order_number, purchase_date, created_at"
      );

    // 브랜드 필터 적용
    if (brand && brand.trim() !== "") {
      query = query.ilike("brand", `%${brand}%`);
    }

    // 날짜 범위 필터 적용
    if (startDate) {
      query = query.gte("purchase_date", startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // 해당 날짜의 끝까지 포함
      query = query.lte("purchase_date", endDateTime.toISOString());
    }

    const { data, error } = await query.order("purchase_date", {
      ascending: false,
    });

    if (error) {
      console.error("도매 상품 조회 실패:", error);
      return NextResponse.json(
        {
          success: false,
          message: "도매 상품 목록을 불러오는 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("도매 상품 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "도매 상품 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
