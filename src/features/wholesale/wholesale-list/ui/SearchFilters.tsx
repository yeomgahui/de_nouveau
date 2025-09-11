"use client";

import { useState } from "react";
import { WholesaleSearchFilters } from "@/entities/wholesale";

interface SearchFiltersProps {
  onFiltersChange: (filters: WholesaleSearchFilters) => void;
  loading?: boolean;
}

export function SearchFilters({
  onFiltersChange,
  loading,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<WholesaleSearchFilters>({
    brand: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (
    key: keyof WholesaleSearchFilters,
    value: string
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFiltersChange(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    const resetFilters: WholesaleSearchFilters = {
      brand: "",
      startDate: "",
      endDate: "",
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* 브랜드 검색 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            브랜드 검색
          </label>
          <input
            type="text"
            value={filters.brand || ""}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="브랜드명을 입력하세요"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 시작 날짜 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시작 날짜
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 종료 날짜 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            종료 날짜
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 검색 및 초기화 버튼 */}
        <div className="flex-shrink-0 flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            검색
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 활성화된 필터 표시 */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {filters.brand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              브랜드: {filters.brand}
              <button
                onClick={() => {
                  handleFilterChange("brand", "");
                  setTimeout(() => {
                    onFiltersChange({ ...filters, brand: "" });
                  }, 0);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              시작: {filters.startDate}
              <button
                onClick={() => {
                  handleFilterChange("startDate", "");
                  setTimeout(() => {
                    onFiltersChange({ ...filters, startDate: "" });
                  }, 0);
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              종료: {filters.endDate}
              <button
                onClick={() => {
                  handleFilterChange("endDate", "");
                  setTimeout(() => {
                    onFiltersChange({ ...filters, endDate: "" });
                  }, 0);
                }}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
