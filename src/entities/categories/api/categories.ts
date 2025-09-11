// 카테고리 타입 정의
export interface Category {
  id: number;
  type: string;
  sort: string;
}

// 카테고리 API 응답 타입
export interface CategoriesResponse {
  success: boolean;
  data?: Category[];
  message?: string;
}

// 카테고리 목록 조회
export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/categories`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // 항상 최신 데이터 가져오기
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "카테고리 데이터를 불러오는데 실패했습니다.",
      };
    }

    return result;
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    return {
      success: false,
      message: "카테고리 데이터를 불러오는 중 오류가 발생했습니다.",
    };
  }
}

// 카테고리 타입별 필터링
export function getCategoriesByType(
  categories: Category[],
  type: string
): Category[] {
  return categories.filter((category) => category.type === type);
}

// 카테고리 정렬 (sort 필드 기준)
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.sort.localeCompare(b.sort));
}
