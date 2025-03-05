// /src/app/dashboard/layout.js

import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar: menu de navegação */}
      <aside className="w-1/5 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard/pages/my-listings" className="block hover:text-gray-400">
                📌 My Listings
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/messages" className="block hover:text-gray-400">
                💬 Messages (Live Chat)
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/profile" className="block hover:text-gray-400">
                👤 Profile
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/settings" className="block hover:text-gray-400">
                ⚙️ Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Área principal onde o conteúdo da rota aninhada será renderizado */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
