import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";
import { SaleStatus } from "@/shared/types/product";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("category_id");
    const saleStatus = searchParams.get("sale_status") as SaleStatus | null;
    const priceMin = searchParams.get("price_min");
    const priceMax = searchParams.get("price_max");
    const search = searchParams.get("search");

    let query = supabaseAdmin
      .from("products")
      .select(
        "id, name, category_id, price, quantity, color, description, wholesale_id, sale_status, sizes, created_at, updated_at"
      );

    if (categoryId) {
      query = query.eq("category_id", Number(categoryId));
    }

    if (saleStatus) {
      query = query.eq("sale_status", saleStatus);
    }

    if (priceMin) {
      query = query.gte("price", Number(priceMin));
    }

    if (priceMax) {
      query = query.lte("price", Number(priceMax));
    }

    if (search && search.trim() !== "") {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("제품 목록 조회 실패:", error);
      return NextResponse.json(
        {
          success: false,
          message: "제품 목록을 불러오는 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("제품 목록 조회 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
