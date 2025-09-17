"use client";

import { useEffect, useState } from "react";
import { ProductSearchFilters } from "@/entities/products";
import { getCategories, Category } from "@/entities/categories/api/categories";
import { SALE_STATUS_LABELS, SaleStatus } from "@/shared/types/product";

interface SearchFiltersProps {
  onFiltersChange: (filters: ProductSearchFilters) => void;
  loading?: boolean;
}

export function SearchFilters({
  onFiltersChange,
  loading,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<ProductSearchFilters>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getCategories();
      if (res.success && res.data) setCategories(res.data);
    })();
  }, []);

  const handleChange = (
    key: keyof ProductSearchFilters,
    value: string | number | undefined
  ) => {
    const next = { ...filters, [key]: value } as ProductSearchFilters;
    // 숫자 필드 정리
    if (key === "category_id" && value === "") delete next.category_id;
    if (key === "price_min" && value === "") delete next.price_min;
    if (key === "price_max" && value === "") delete next.price_max;
    if (key === "sale_status" && value === "") delete next.sale_status;
    if (key === "search" && value === "") delete next.search;
    setFilters(next);
  };

  const handleSearch = () => onFiltersChange(filters);
  const handleReset = () => {
    setFilters({});
    onFiltersChange({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            value={filters.category_id ?? ""}
            onChange={(e) =>
              handleChange(
                "category_id",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
          >
            <option value="">전체</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.sort}
              </option>
            ))}
          </select>
        </div>

        {/* 판매 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            판매 상태
          </label>
          <select
            value={filters.sale_status ?? ""}
            onChange={(e) =>
              handleChange(
                "sale_status",
                (e.target.value as SaleStatus) || undefined
              )
            }
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
          >
            <option value="">전체</option>
            {(["SELLING", "SOLD_OUT", "HIDDEN"] as SaleStatus[]).map((s) => (
              <option key={s} value={s}>
                {SALE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {/* 최소 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최소 가격
          </label>
          <input
            type="number"
            value={filters.price_min ?? ""}
            onChange={(e) =>
              handleChange(
                "price_min",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            onKeyPress={handleKeyPress}
            placeholder="0"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
          />
        </div>

        {/* 최대 가격 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최대 가격
          </label>
          <input
            type="number"
            value={filters.price_max ?? ""}
            onChange={(e) =>
              handleChange(
                "price_max",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            onKeyPress={handleKeyPress}
            placeholder="0"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
          />
        </div>

        {/* 검색어 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상품명 검색
          </label>
          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(e) => handleChange("search", e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="상품명을 입력하세요"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
        >
          검색
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
