"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Product,
  ProductSearchFilters,
  getProducts,
} from "@/entities/products";
import { SearchFilters } from "./SearchFilters";
import { SaleStatusBadge } from "@/shared/ui/SaleStatusBadge";

export function ProductTable() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductSearchFilters>({});

  const fetchProducts = useCallback(async (f?: ProductSearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts(f);
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError(res.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (e) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFiltersChange = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const formatPrice = useMemo(
    () => (price: number) =>
      new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
      }).format(price),
    []
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <SearchFilters
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">등록된 제품이 없습니다.</p>
          <p className="text-gray-500 text-sm mt-2">새 제품을 등록해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchFilters onFiltersChange={handleFiltersChange} loading={loading} />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수량
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((p, index) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/admin/product/${p.id}`)}
                  className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {p.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {p.name}
                    </div>
                    {p.color && (
                      <div className="text-xs text-gray-500">
                        색상: {p.color}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(p.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{p.quantity}개</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SaleStatusBadge status={p.sale_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(p.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <a
                        onClick={(e) => e.stopPropagation()}
                        href={`/admin/product/register?wholesale_id=${p.wholesale_id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 font-medium"
                      >
                        상세/등록
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              총{" "}
              <span className="font-medium text-gray-900">
                {products.length}
              </span>
              개 상품
            </div>
            <div className="text-sm font-medium text-gray-900">
              총 재고 금액:{" "}
              {formatPrice(
                products.reduce((s, p) => s + p.price * p.quantity, 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
