import { EditWholesaleForm } from "@/features/wholesale/edit-wholesale";

interface EditWholesalePageProps {
  params: {
    id: string;
  };
}

export default function EditWholesalePage({ params }: EditWholesalePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-wide">
                도매 상품 수정
              </h1>
              <p className="mt-2 text-gray-600">
                등록된 도매 상품 정보를 수정하세요.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/admin/wholesale/list"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                목록으로
              </a>
            </div>
          </div>
        </div>

        {/* 수정 폼 */}
        <EditWholesaleForm productId={params.id} />
      </div>
    </div>
  );
}
