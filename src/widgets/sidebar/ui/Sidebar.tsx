import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen border-r bg-white p-4">
      <nav className="space-y-2">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/wholesale/list"
              className="block rounded px-3 py-2 hover:bg-gray-100"
            >
              사입 관리
            </Link>
          </li>
          <li>
            <Link
              href="/admin/product/list"
              className="block rounded px-3 py-2 hover:bg-gray-100"
            >
              제품 관리
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
