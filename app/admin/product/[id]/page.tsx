import { Suspense } from "react";
import { notFound } from "next/navigation";

async function getProductDetail(id: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.success || !data?.data) return null;
  return data.data;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return notFound();

  const product = await getProductDetail(id);
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 tracking-wide">
            제품 상세
          </h1>
          <p className="mt-2 text-gray-600">제품 정보를 확인하세요.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">ID</div>
              <div className="text-gray-900 font-medium">{product.id}</div>
            </div>
            <div>
              <div className="text-gray-500">상품명</div>
              <div className="text-gray-900 font-medium">{product.name}</div>
            </div>
            <div>
              <div className="text-gray-500">가격</div>
              <div className="text-gray-900 font-medium">
                {product.price?.toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-gray-500">수량</div>
              <div className="text-gray-900 font-medium">
                {product.quantity}개
              </div>
            </div>
            <div>
              <div className="text-gray-500">상태</div>
              <div className="text-gray-900 font-medium">
                {product.sale_status}
              </div>
            </div>
            <div>
              <div className="text-gray-500">등록일</div>
              <div className="text-gray-900 font-medium">
                {new Date(product.created_at).toLocaleDateString("ko-KR")}
              </div>
            </div>
          </div>

          {product.description && (
            <div>
              <div className="text-gray-500 mb-1">설명</div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          )}

          <div className="pt-4">
            <a
              href={`/admin/product/register?wholesale_id=${product.wholesale_id}`}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              이 도매상품으로 등록 이동
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
