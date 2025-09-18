import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 ID" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, category_id, price, quantity, color, description, wholesale_id, sale_status, sizes, created_at, updated_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("제품 상세 조회 실패:", error);
      return NextResponse.json(
        { success: false, message: "제품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("제품 상세 조회 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
