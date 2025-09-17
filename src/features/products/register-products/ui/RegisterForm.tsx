"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { getCategories, Category } from "@/entities/categories";
import { getWholesaleProducts, WholesaleProduct } from "@/entities/wholesale";
import { registerProduct } from "../api/register-product";

interface FormState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

function SubmitButton({ isUploadingImages }: { isUploadingImages: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || isUploadingImages;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full bg-gray-800 text-white py-4 px-8 rounded-none hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 font-medium text-lg tracking-wide uppercase letter-spacing-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isUploadingImages
        ? "이미지 처리 중..."
        : pending
        ? "Vercel Blob 업로드 중..."
        : "상품 등록"}
    </button>
  );
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<FormState, FormData>(
    registerProduct,
    {}
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [wholesaleProducts, setWholesaleProducts] = useState<
    WholesaleProduct[]
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [wholesaleLoading, setWholesaleLoading] = useState(true);

  // 이미지 미리보기를 위한 상태
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageBlobs, setImageBlobs] = useState<Blob[]>([]);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {}
  );

  // 사이즈 관리를 위한 상태
  const [sizes, setSizes] = useState<Record<string, string>>({});

  // 카테고리 및 도매 상품 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        // 카테고리 로드
        const categoriesResult = await getCategories();
        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        } else {
          console.error("카테고리 로드 실패:", categoriesResult.message);
        }

        // 도매 상품 로드
        const wholesaleResult = await getWholesaleProducts();
        if (wholesaleResult.success && wholesaleResult.data) {
          setWholesaleProducts(wholesaleResult.data);
        } else {
          console.error("도매 상품 로드 실패:", wholesaleResult.message);
        }
      } catch (error) {
        console.error("데이터 로드 오류:", error);
      } finally {
        setCategoriesLoading(false);
        setWholesaleLoading(false);
      }
    }

    loadData();
  }, []);

  // 성공 시 폼 초기화
  useEffect(() => {
    if (state?.success) {
      // 기존 Blob URL들 정리
      cleanupBlobUrls(imagePreviews);
      cleanupBlobUrls(blobUrls);

      formRef.current?.reset();
      setImagePreviews([]);
      setSelectedImages([]);
      setImageBlobs([]);
      setBlobUrls([]);
      setMainImageIndex(0);
      setSizes({});
      setIsUploadingImages(false);
      setUploadProgress({});

      console.log("폼이 초기화됨 - Vercel Blob 업로드 준비 완료");
    }
  }, [state?.success]);

  // URL query string에서 wholesale_id 처리
  const defaultWholesaleId = searchParams.get("wholesale_id");

  // 파일을 Blob으로 변환하는 함수
  const convertFileToBlob = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: file.type });
        resolve(blob);
      };
      reader.onerror = () => reject(new Error("파일 읽기 실패"));
      reader.readAsArrayBuffer(file);
    });
  };

  // Blob URL 정리 함수
  const cleanupBlobUrls = (urls: string[]) => {
    urls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };

  // 컴포넌트 언마운트 시 Blob URL 정리
  useEffect(() => {
    return () => {
      cleanupBlobUrls(blobUrls);
      cleanupBlobUrls(imagePreviews);
    };
  }, []);

  // Blob URL 배열이 변경될 때마다 이전 URL들 정리
  useEffect(() => {
    return () => {
      cleanupBlobUrls(blobUrls);
    };
  }, [blobUrls]);

  // 이미지 업로드 핸들러 (Vercel Blob 최적화)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 파일 크기 및 형식 검증
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const invalidFiles = files.filter(
      (file) => file.size > maxFileSize || !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        `다음 파일들이 지원되지 않습니다:\n${invalidFiles
          .map(
            (f) =>
              `${f.name} (${
                f.size > maxFileSize ? "파일 크기 초과" : "지원되지 않는 형식"
              })`
          )
          .join("\n")}\n\n지원 형식: JPEG, PNG, WebP (최대 10MB)`
      );
      return;
    }

    setIsUploadingImages(true);

    try {
      // 기존 이미지와 합쳐서 최대 10장까지
      const newImages = [...selectedImages, ...files].slice(0, 10);
      setSelectedImages(newImages);

      // 새로운 파일들을 Blob으로 변환 (진행률 추적)
      const newBlobs: Blob[] = [];
      const newProgress: Record<number, number> = { ...uploadProgress };

      for (let i = 0; i < files.length; i++) {
        const fileIndex = selectedImages.length + i;
        newProgress[fileIndex] = 0;
        setUploadProgress({ ...newProgress });

        const blob = await convertFileToBlob(files[i]);
        newBlobs.push(blob);

        newProgress[fileIndex] = 100;
        setUploadProgress({ ...newProgress });
      }

      // 기존 Blob과 합치기
      const updatedBlobs = [...imageBlobs, ...newBlobs].slice(0, 10);
      setImageBlobs(updatedBlobs);

      // 이전 Blob URL들 정리
      cleanupBlobUrls(blobUrls);

      // 새로운 Blob URL들 생성
      const newBlobUrls = updatedBlobs.map((blob) => URL.createObjectURL(blob));
      setBlobUrls(newBlobUrls);

      // 미리보기용 URL 생성 (기존 방식과 호환성 유지)
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));

      console.log(
        `${files.length}개 이미지가 Blob으로 변환됨 (Vercel Blob 업로드 준비 완료)`
      );
    } catch (error) {
      console.error("이미지 업로드 처리 중 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다. 파일을 다시 선택해주세요.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    // 제거될 URL 정리
    if (imagePreviews[index] && imagePreviews[index].startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    if (blobUrls[index] && blobUrls[index].startsWith("blob:")) {
      URL.revokeObjectURL(blobUrls[index]);
    }

    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newBlobs = imageBlobs.filter((_, i) => i !== index);
    const newBlobUrls = blobUrls.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    setImageBlobs(newBlobs);
    setBlobUrls(newBlobUrls);
    setMainImageIndex(mainImageIndex >= newImages.length ? 0 : mainImageIndex);
  };

  const setMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  // 사이즈 관리 함수들
  const addSizeEntry = () => {
    const newKey = `size_${Object.keys(sizes).length + 1}`;
    setSizes((prev) => ({ ...prev, [newKey]: "" }));
  };

  const updateSizeKey = (oldKey: string, newKey: string) => {
    if (newKey === oldKey) return;

    setSizes((prev) => {
      const newSizes = { ...prev };
      const value = newSizes[oldKey];
      delete newSizes[oldKey];
      newSizes[newKey] = value;
      return newSizes;
    });
  };

  const updateSizeValue = (key: string, value: string) => {
    setSizes((prev) => ({ ...prev, [key]: value }));
  };

  const removeSizeEntry = (key: string) => {
    setSizes((prev) => {
      const newSizes = { ...prev };
      delete newSizes[key];
      return newSizes;
    });
  };

  // 폼 제출 전 사이즈 데이터를 숨겨진 input에 설정 (Blob 기반)
  const handleSubmit = async (formData: FormData) => {
    try {
      // Blob 데이터를 File 객체로 변환하여 추가
      if (imageBlobs.length > 0) {
        imageBlobs.forEach((blob, index) => {
          // 원본 파일명을 유지하거나 기본 파일명 생성
          const fileName =
            selectedImages[index]?.name || `image_${index + 1}.jpg`;
          const file = new File([blob], fileName, { type: blob.type });
          formData.append("images", file);
        });
      } else {
        // Blob이 없으면 기존 방식 사용 (후방 호환성)
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      // 사이즈 데이터를 JSON 문자열로 변환하여 추가
      formData.set("sizes", JSON.stringify(sizes));

      // 메인 이미지 인덱스 추가
      formData.set("main_image_index", mainImageIndex.toString());

      // Blob URL 개수 정보 추가 (디버깅용)
      formData.set("blob_count", imageBlobs.length.toString());

      return formAction(formData);
    } catch (error) {
      console.error("폼 제출 처리 중 오류:", error);
      alert("폼 제출 중 오류가 발생했습니다.");
    }
  };

  if (categoriesLoading || wholesaleLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-light text-gray-800 mb-2 tracking-wide">
          상품 등록
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-gray-300 to-gray-500 mx-auto"></div>
      </div>

      {state?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{state.message}</p>
        </div>
      )}

      {state?.message && !state?.success && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{state.message}</p>
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-8">
        {/* 상품명 */}
        <div className="group">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            상품명
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.name
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="상품명을 입력하세요"
          />
          {state?.errors?.name && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.name}
            </p>
          )}
        </div>

        {/* 카테고리 */}
        <div className="group">
          <label
            htmlFor="category_id"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            카테고리
            <span className="text-red-400 ml-1">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 ${
              state?.errors?.category_id
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.type} - {category.sort}
              </option>
            ))}
          </select>
          {state?.errors?.category_id && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.category_id}
            </p>
          )}
        </div>

        {/* 가격 */}
        <div className="group">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            가격 (원)
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="100"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.price
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="가격을 입력하세요"
          />
          {state?.errors?.price && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.price}
            </p>
          )}
        </div>

        {/* 수량 */}
        <div className="group">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            수량
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.quantity
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="수량을 입력하세요"
          />
          {state?.errors?.quantity && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.quantity}
            </p>
          )}
        </div>

        {/* 색상 */}
        <div className="group">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            색상
          </label>
          <input
            type="text"
            id="color"
            name="color"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.color
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="상품의 색상을 입력하세요 (예: 블랙, 화이트, 네이비 등)"
          />
          {state?.errors?.color && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.color}
            </p>
          )}
        </div>

        {/* 사이즈 */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase">
            사이즈
          </label>
          <div className="space-y-3">
            {Object.entries(sizes).map(([key, value], index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => updateSizeKey(key, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="사이즈명 (예: S, M, L, XL, Free)"
                />
                <span className="text-gray-400 font-medium">:</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateSizeValue(key, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="사이즈 상세 (예: 가슴둘레 100cm, 총장 70cm)"
                />
                <button
                  type="button"
                  onClick={() => removeSizeEntry(key)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSizeEntry}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              사이즈 추가
            </button>
          </div>

          {state?.errors?.sizes && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.sizes}
            </p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            사이즈명과 상세 정보를 입력하세요. 예: S - 가슴둘레 90cm, 총장 65cm
          </p>
        </div>

        {/* 도매 상품 선택 */}
        <div className="group">
          <label
            htmlFor="wholesale_id"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            도매 상품
            <span className="text-red-400 ml-1">*</span>
          </label>
          <select
            id="wholesale_id"
            name="wholesale_id"
            defaultValue={defaultWholesaleId || ""}
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 ${
              state?.errors?.wholesale_id
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
          >
            <option value="">도매 상품을 선택하세요</option>
            {wholesaleProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.supplier} (가격:{" "}
                {product.price.toLocaleString()}원)
              </option>
            ))}
          </select>
          {state?.errors?.wholesale_id && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.wholesale_id}
            </p>
          )}
        </div>

        {/* 사진 업로드 */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase">
            상품 사진 (최대 10장)
            <span className="text-red-400 ml-1">*</span>
            <span className="text-xs text-blue-600 ml-2 normal-case">
              Blob 업로드 지원
            </span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            disabled={isUploadingImages}
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border-gray-200 group-hover:border-gray-300 ${
              isUploadingImages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />

          {isUploadingImages && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              이미지를 Blob으로 변환 중...
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            지원 형식: JPEG, PNG, WebP | 최대 크기: 10MB | Vercel Blob Storage
            사용
          </div>
          {state?.errors?.images && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.images}
            </p>
          )}

          {/* 이미지 미리보기 */}
          {imagePreviews.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  업로드된 사진 ({imagePreviews.length}/10)
                </p>
                <p className="text-xs text-green-600">
                  ✓ Blob 처리됨 ({imageBlobs.length}개)
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`상품 사진 ${index + 1}`}
                      className={`w-full h-24 object-cover rounded-md border-2 ${
                        mainImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200"
                      }`}
                    />
                    {mainImageIndex === index && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                        메인
                      </div>
                    )}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1">
                      <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        className={`w-full text-xs py-1 rounded ${
                          mainImageIndex === index
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {mainImageIndex === index ? "메인 사진" : "메인으로"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 상품 설명 */}
        <div className="group">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            상품 설명
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none ${
              state?.errors?.description
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="상품에 대한 자세한 설명을 입력해주세요. 사이즈, 소재, 특징 등을 포함해주세요."
          />
          {state?.errors?.description && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.description}
            </p>
          )}
        </div>

        {/* 판매 상태 */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase">
            판매 상태 설정
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <input
                type="radio"
                id="selling"
                name="sale_status"
                value="SELLING"
                defaultChecked
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <label
                htmlFor="selling"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                <span className="text-green-600">●</span> 판매중
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sold_out"
                name="sale_status"
                value="SOLD_OUT"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <label
                htmlFor="sold_out"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                <span className="text-orange-600">●</span> 품절
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="hidden"
                name="sale_status"
                value="HIDDEN"
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
              />
              <label
                htmlFor="hidden"
                className="ml-3 text-sm font-medium text-gray-700"
              >
                <span className="text-gray-600">●</span> 숨김
              </label>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <p>
              <strong>판매중:</strong> 사용자에게 노출되며 구매 가능
            </p>
            <p>
              <strong>품절:</strong> 사용자에게 노출되지만 구매 불가
            </p>
            <p>
              <strong>숨김:</strong> 관리자만 볼 수 있음
            </p>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center pt-8">
          <SubmitButton isUploadingImages={isUploadingImages} />
        </div>
      </form>
    </div>
  );
}
