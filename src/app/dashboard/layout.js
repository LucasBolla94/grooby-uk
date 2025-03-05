// /src/app/dashboard/layout.js

import Link from 'next/link';
import Logo from '../components/logo';
import Footer from '../components/footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
       {/* Fixed navbar at the top */}
            <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
              <Logo />
            </nav>
      {/* Sidebar: menu de navegação */}
      <aside className="w-1/5 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-3">
          <li>
              <Link href="/dashboard/" className="block hover:text-gray-400">
               💻 Home
              </Link>
            </li>
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
