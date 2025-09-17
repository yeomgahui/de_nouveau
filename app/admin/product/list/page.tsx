import { ProductTable } from "@/features/products/product-list";

export default function ProductListPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-wide">
                제품 목록
              </h1>
              <p className="mt-2 text-gray-600">
                등록된 제품들을 확인하고 관리하세요.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/admin/product/register"
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                새 제품 등록
              </a>
            </div>
          </div>
        </div>

        <ProductTable />
      </div>
    </div>
  );
}
