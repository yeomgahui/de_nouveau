"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  getWholesaleProduct,
  updateWholesaleProduct,
} from "../api/edit-wholesale";
import { WholesaleProduct } from "@/entities/wholesale";

interface FormState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-800 text-white py-4 px-8 rounded-none hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 font-medium text-lg tracking-wide uppercase letter-spacing-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "수정 중..." : "상품 수정"}
    </button>
  );
}

interface EditFormProps {
  productId: string;
}

export function EditForm({ productId }: EditFormProps) {
  const [product, setProduct] = useState<WholesaleProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [state, formAction] = useActionState<FormState, FormData>(
    (prevState: FormState, formData: FormData) =>
      updateWholesaleProduct(productId, prevState, formData),
    {}
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getWholesaleProduct(productId);

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError(result.message || "상품 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        setError("상품 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-light text-gray-800 mb-2 tracking-wide">
          도매 상품 수정
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

      <form action={formAction} className="space-y-8">
        {/* 사입 번호와 사입 날짜 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="order_number"
              className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
            >
              사입 번호 *
            </label>
            <input
              type="text"
              id="order_number"
              name="order_number"
              defaultValue={product.order_number}
              required
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
              placeholder="사입 번호를 입력하세요"
            />
            {state?.errors?.order_number && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.order_number}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="purchase_date"
              className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
            >
              사입 날짜 *
            </label>
            <input
              type="date"
              id="purchase_date"
              name="purchase_date"
              defaultValue={
                product.purchase_date
                  ? new Date(product.purchase_date).toISOString().split("T")[0]
                  : ""
              }
              required
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
            />
            {state?.errors?.purchase_date && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.purchase_date}
              </p>
            )}
          </div>
        </div>

        {/* 상품명 */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
          >
            상품명 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={product.name}
            required
            className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
            placeholder="상품명을 입력하세요"
          />
          {state?.errors?.name && (
            <p className="text-red-600 text-sm mt-1">{state.errors.name}</p>
          )}
        </div>

        {/* 도매 거래처 */}
        <div className="space-y-2">
          <label
            htmlFor="supplier"
            className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
          >
            도매 거래처 *
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            defaultValue={product.supplier}
            required
            className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
            placeholder="거래처명을 입력하세요"
          />
          {state?.errors?.supplier && (
            <p className="text-red-600 text-sm mt-1">{state.errors.supplier}</p>
          )}
        </div>

        {/* 브랜드 */}
        <div className="space-y-2">
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
          >
            브랜드
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            defaultValue={product.brand || ""}
            className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
            placeholder="브랜드명을 입력하세요 (선택사항)"
          />
          {state?.errors?.brand && (
            <p className="text-red-600 text-sm mt-1">{state.errors.brand}</p>
          )}
        </div>

        {/* 가격과 수량 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
            >
              가격 (원) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              defaultValue={product.price}
              min="0"
              step="1"
              required
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
              placeholder="0"
            />
            {state?.errors?.price && (
              <p className="text-red-600 text-sm mt-1">{state.errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
            >
              수량 *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              defaultValue={product.quantity}
              min="1"
              required
              className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white"
              placeholder="1"
            />
            {state?.errors?.quantity && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors.quantity}
              </p>
            )}
          </div>
        </div>

        {/* 상품 설명 */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
          >
            상품 설명
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description || ""}
            className="w-full px-4 py-4 border border-gray-200 rounded-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 text-lg bg-gray-50 hover:bg-white resize-none"
            placeholder="상품에 대한 추가 설명을 입력하세요 (선택사항)"
          />
          {state?.errors?.description && (
            <p className="text-red-600 text-sm mt-1">
              {state.errors.description}
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
