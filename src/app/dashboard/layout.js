'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/logo';
import Footer from '../components/footer';
import { HiMenu, HiX } from 'react-icons/hi';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Navbar fixa no topo */}
      <nav className="flex items-center justify-between bg-white shadow-md z-50 px-4 py-3 md:py-4 md:px-6 fixed w-full md:static">
        <div className="flex items-center pt-14">
          <Logo />
        </div>
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="md:hidden text-gray-800 focus:outline-none"
        >
          {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </nav>

      {/* Sidebar: menu de navegação */}
      <aside
        className={`bg-gray-900 text-white p-6 fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out w-64 md:w-1/5 z-40 md:static`}
      >
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard/">
                <a
                  className="block hover:text-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  💻 Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/my-listings">
                <a
                  className="block hover:text-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  📌 My Listings
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/messages">
                <a
                  className="block hover:text-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  💬 Messages (Live Chat)
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/profile">
                <a
                  className="block hover:text-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  👤 Profile
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/pages/settings">
                <a
                  className="block hover:text-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  ⚙️ Settings
                </a>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Opcional: Footer da sidebar */}
        <Footer />
      </aside>

      {/* Área principal onde o conteúdo é renderizado */}
      <main className="flex-1 p-8 mt-16 md:mt-0 md:ml-64 overflow-auto">
        {children}
      </main>
    </div>
  );
}
