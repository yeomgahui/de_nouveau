import { RegisterForm } from "@/features/products/register-products";
import { Suspense } from "react";

function RegisterFormWrapper() {
  return <RegisterForm />;
}

export default function RegisterProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-600">로딩 중...</div>
        </div>
      }
    >
      <RegisterFormWrapper />
    </Suspense>
  );
}
