import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/shared/lib/supabase";
import { put } from "@vercel/blob";
import { SaleStatus } from "@/shared/types/product";

// Vercel Blob 설정 확인
const checkBlobConfig = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않았습니다.");
  }
  return token;
};

// 이미지 레코드 타입 정의 (현재 DB 컬럼에 맞춤)
interface ImageRecord {
  product_id: number;
  image_url: string; // 현재는 파일명만 저장하지만 컬럼명은 image_url 유지
  is_main: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Vercel Blob 설정 확인
    checkBlobConfig();

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

    // color 문자열을 배열로 변환 (JSON 배열 또는 콤마 구분 문자열 모두 지원)
    let colorArray: string[] | null = null;
    if (color && color.trim() !== "") {
      const raw = color.trim();
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          colorArray = parsed
            .map((c) => (typeof c === "string" ? c.trim() : String(c)))
            .filter((c) => c.length > 0);
        } else if (typeof parsed === "string") {
          colorArray = parsed
            .split(/[,\n]+/)
            .map((c) => c.trim())
            .filter((c) => c.length > 0);
        }
      } catch {
        colorArray = raw
          .split(/[，,\n]+/)
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
      }
      if (colorArray && colorArray.length === 0) {
        colorArray = null;
      }
    }

    // 제품 데이터 삽입
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        category_id: category_id,
        price: price,
        quantity: quantity,
        color: colorArray,
        description: description?.trim() || null,
        wholesale_id: wholesale_id,
        sale_status: sale_status,
        sizes: sizes,
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
        const imageRecords: ImageRecord[] = [];
        const uploadPromises: Promise<{
          index: number;
          blob: { url: string };
          fileName: string;
        }>[] = [];

        // 병렬로 이미지 업로드 처리
        for (let index = 0; index < validImages.length; index++) {
          const file = validImages[index];

          // 파일 확장자 안전하게 가져오기
          const fileExtension = file.type.split("/")[1] || "jpg";
          const fileName =
            index === main_image_index ? "main" : `detail_${index}`;
          const sanitizedFileName = `${fileName}.${fileExtension}`;

          // PK 기반 폴더 구조: products/images/{product_id}/{filename}
          const blobPath = `products/images/${product.id}/${sanitizedFileName}`;

          // Vercel Blob에 업로드 (병렬 처리)
          const uploadPromise = put(blobPath, file, {
            access: "public",
            addRandomSuffix: false, // PK 폴더 구조로 중복 방지되므로 false
          }).then((blob) => ({
            index,
            blob,
            fileName: sanitizedFileName,
          }));

          uploadPromises.push(uploadPromise);
        }

        // 모든 업로드 완료 대기
        const uploadResults = await Promise.all(uploadPromises);

        // 성공한 업로드들을 기반으로 DB 레코드 생성
        uploadResults.forEach(({ index, blob, fileName }) => {
          imageRecords.push({
            product_id: product.id,
            image_url: fileName, // 파일명만 저장 (컬럼명은 image_url이지만 실제로는 파일명)
            is_main: index === main_image_index,
          });
        });

        console.log(`${imageRecords.length}개 이미지가 Vercel Blob에 업로드됨`);

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
              uploaded_images: uploadResults.length,
            },
            { status: 201 }
          );
        }

        console.log(`${imageRecords.length}개 이미지 정보가 DB에 저장됨`);
      } catch (uploadError) {
        console.error("이미지 업로드 오류:", uploadError);

        // Blob 토큰 관련 오류인지 확인
        const errorMessage =
          uploadError instanceof Error ? uploadError.message : "Unknown error";
        if (errorMessage.includes("BLOB_READ_WRITE_TOKEN")) {
          return NextResponse.json(
            {
              success: false,
              message: "Blob Storage 설정 오류: 환경변수를 확인해주세요.",
              error: errorMessage,
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            message:
              "제품이 등록되었지만 이미지 업로드 중 오류가 발생했습니다.",
            data: product,
            error: errorMessage,
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
