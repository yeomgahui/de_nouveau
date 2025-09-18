// 이미지 URL 관련 유틸리티 함수

// Vercel Blob의 기본 URL (환경변수에서 관리)
const BLOB_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
  "https://your-blob-storage.vercel-storage.com";

/**
 * 상품 이미지의 전체 URL을 생성합니다
 * @param productId - 상품 ID
 * @param fileName - 파일명 (예: "main.jpg", "detail_1.png")
 * @returns 전체 이미지 URL
 */
export function getProductImageUrl(
  productId: number,
  fileName: string
): string {
  return `${BLOB_BASE_URL}/products/images/${productId}/${fileName}`;
}

/**
 * 상품의 메인 이미지 URL을 생성합니다
 * @param productId - 상품 ID
 * @param extension - 파일 확장자 (예: "jpg", "png")
 * @returns 메인 이미지 URL
 */
export function getMainImageUrl(
  productId: number,
  extension: string = "jpg"
): string {
  return getProductImageUrl(productId, `main.${extension}`);
}

/**
 * 상품의 모든 이미지 URL 목록을 생성합니다
 * @param productId - 상품 ID
 * @param imagePaths - 파일 경로 배열
 * @returns 이미지 URL 배열
 */
export function getProductImageUrls(
  productId: number,
  imagePaths: string[]
): string[] {
  return imagePaths.map((path) => getProductImageUrl(productId, path));
}

/**
 * 이미지 경로에서 파일명을 추출합니다
 * @param fullPath - 전체 경로
 * @returns 파일명
 */
export function extractFileName(fullPath: string): string {
  return fullPath.split("/").pop() || fullPath;
}

/**
 * 파일 확장자를 추출합니다
 * @param fileName - 파일명
 * @returns 확장자 (dot 없이)
 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop() || "jpg";
}
