import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";
import { put } from "@vercel/blob";
import { SaleStatus } from "@/shared/types/product";

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const formData = await request.formData();

    // FormData에서 데이터 추출
    const name = formData.get("name") as string;
    const category_id = Number(formData.get("category_id"));
    const price = Number(formData.get("price"));
    const quantity = Number(formData.get("quantity"));
    const color = formData.get("color") as string;
    const description = formData.get("description") as string;
    const wholesale_id = Number(formData.get("wholesale_id"));
    const sale_status = formData.get("sale_status") as SaleStatus;
    const main_image_index = Number(formData.get("main_image_index")) || 0;

    // 사이즈 데이터 처리
    const sizesData = formData.get("sizes") as string;
    let sizes = null;
    if (sizesData) {
      try {
        sizes = JSON.parse(sizesData);
      } catch (error) {
        console.error("사이즈 데이터 파싱 오류:", error);
      }
    }

    // 이미지 파일들 추출
    const imageFiles = formData.getAll("images") as File[];
    const validImages = imageFiles.filter((file) => file.size > 0);

    // 기본 검증
    if (!name || !category_id || !price || !quantity || !wholesale_id) {
      return NextResponse.json(
        {
          success: false,
          message: "필수 필드가 누락되었습니다.",
        },
        { status: 400 }
      );
    }

    // 이미지 파일 검증
    if (validImages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "상품 이미지를 최소 1장 이상 업로드해주세요.",
        },
        { status: 400 }
      );
    }

    // 제품 데이터 삽입
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        category_id: category_id,
        price: price,
        quantity: quantity,
        color: color?.trim() || null,
        description: description?.trim() || null,
        wholesale_id: wholesale_id,
        sale_status: sale_status,
        sizes: sizes,
        main_image_index: main_image_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (productError) {
      console.error("제품 삽입 오류:", productError);
      return NextResponse.json(
        {
          success: false,
          message: "제품 등록 중 오류가 발생했습니다.",
          error: productError.message,
        },
        { status: 500 }
      );
    }

    // 실제 이미지 파일 업로드 및 정보 저장
    if (validImages.length > 0 && product) {
      try {
        const imageRecords = [];

        // 각 이미지 파일을 Vercel Blob에 업로드
        for (let index = 0; index < validImages.length; index++) {
          const file = validImages[index];
          const fileName = `product_${product.id}_${index}_${Date.now()}.${
            file.type.split("/")[1]
          }`;

          // Vercel Blob에 업로드
          const blob = await put(fileName, file, {
            access: "public",
          });

          imageRecords.push({
            product_id: product.id,
            image_url: blob.url,
            image_order: index,
            is_main: index === main_image_index,
            created_at: new Date().toISOString(),
          });
        }

        // product_images 테이블에 저장
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imageError) {
          console.error("이미지 정보 삽입 오류:", imageError);
          // 제품은 등록되었지만 이미지 정보 저장 실패
          return NextResponse.json(
            {
              success: true,
              message:
                "제품이 등록되었지만 이미지 정보 저장 중 오류가 발생했습니다.",
              data: product,
            },
            { status: 201 }
          );
        }
      } catch (uploadError) {
        console.error("이미지 업로드 오류:", uploadError);
        return NextResponse.json(
          {
            success: true,
            message:
              "제품이 등록되었지만 이미지 업로드 중 오류가 발생했습니다.",
            data: product,
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "제품이 성공적으로 등록되었습니다.",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
