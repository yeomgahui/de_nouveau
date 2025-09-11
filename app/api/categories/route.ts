import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // 카테고리 데이터 조회 (id 순서대로 정렬)
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("카테고리 조회 실패:", error);
      return NextResponse.json(
        {
          success: false,
          message: "카테고리 데이터를 불러오는 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("카테고리 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "카테고리 데이터를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
