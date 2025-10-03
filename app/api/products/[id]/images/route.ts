import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";
import { getProductImageUrl } from "@/shared/lib/image-utils";
import { list } from "@vercel/blob";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 ID" },
        { status: 400 }
      );
    }

    // 1) Vercel Blob에서 직접 목록을 가져오는 경로 (권장)
    try {
      const prefix = `products/images/${id}/`;
      const blobs = await list({ prefix });
      if (blobs?.blobs?.length) {
        const mapped = blobs.blobs
          .sort((a, b) => a.pathname.localeCompare(b.pathname))
          .map((b, index) => {
            const fileName = b.pathname.split("/").pop() || b.pathname;
            return {
              id: index + 1,
              product_id: id,
              image_url: fileName,
              is_main: /^main\./.test(fileName),
              full_url: b.url,
            };
          })
          // 메인 이미지가 먼저 오도록 정렬
          .sort((a, b) => (a.is_main === b.is_main ? 0 : a.is_main ? -1 : 1));

        return NextResponse.json({ success: true, data: mapped });
      }
    } catch (blobErr) {
      // Blob 목록 조회 실패 시 DB 경로로 폴백
      console.warn("Vercel Blob 목록 조회 실패, DB로 폴백:", blobErr);
    }

    // 2) DB에 저장된 파일명 기반으로 URL 구성 (폴백)
    const { data, error } = await supabaseAdmin
      .from("product_images")
      .select("id, product_id, image_url, is_main")
      .eq("product_id", id)
      .order("is_main", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      console.error("제품 이미지 조회 실패:", error);
      return NextResponse.json(
        { success: false, message: "이미지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const withUrls = (data || []).map((img) => {
      const isAbsolute = /^https?:\/\//i.test(img.image_url);
      return {
        ...img,
        full_url: isAbsolute
          ? img.image_url
          : getProductImageUrl(img.product_id, img.image_url),
      };
    });

    return NextResponse.json({ success: true, data: withUrls });
  } catch (error) {
    console.error("제품 이미지 조회 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
