"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerWholesaleProduct } from "../api/register-wholesale";

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
      {pending ? "등록 중..." : "상품 등록"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    registerWholesaleProduct,
    {}
  );

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-light text-gray-800 mb-2 tracking-wide">
          도매 상품 등록
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
        {/* 상품명 */}
        <div className="group">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            상품명
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

        {/* 도매 거래처 */}
        <div className="group">
          <label
            htmlFor="supplier"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            도매 거래처
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.supplier
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="도매 거래처를 입력하세요"
          />
          {state?.errors?.supplier && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.supplier}
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
            required
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
            required
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

        {/* 브랜드 */}
        <div className="group">
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            브랜드
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.brand
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="브랜드를 입력하세요"
          />
          {state?.errors?.brand && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.brand}
            </p>
          )}
        </div>

        {/* 사입 일자 */}
        <div className="group">
          <label
            htmlFor="purchase_date"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            사입 일자
          </label>
          <input
            type="date"
            id="purchase_date"
            name="purchase_date"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.purchase_date
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
          />
          {state?.errors?.purchase_date && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.purchase_date}
            </p>
          )}
        </div>

        {/* 순번 */}
        <div className="group">
          <label
            htmlFor="order"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            순번
          </label>
          <input
            type="number"
            id="order"
            name="order"
            min="1"
            className={`w-full px-6 py-4 border-0 border-b-2 bg-gray-50 focus:outline-none focus:ring-0 focus:border-gray-400 transition-all duration-300 text-gray-800 placeholder-gray-400 ${
              state?.errors?.order
                ? "border-red-400 bg-red-50"
                : "border-gray-200 group-hover:border-gray-300"
            }`}
            placeholder="순번을 입력하세요"
          />
          {state?.errors?.order && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.order}
            </p>
          )}
        </div>

        {/* 비고 */}
        <div className="group">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-600 mb-3 tracking-wide uppercase"
          >
            비고
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
            placeholder="비고사항을 입력하세요 (선택사항)"
          />
          {state?.errors?.description && (
            <p className="mt-2 text-sm text-red-500 font-light">
              {state.errors.description}
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center pt-8">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
