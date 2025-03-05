'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/logo';
import Footer from '../components/footer';
import { HiMenu, HiX } from 'react-icons/hi';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Bloqueia o scroll da página quando o menu está aberto no mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Navbar fixa no topo */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <Logo />
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="md:hidden text-gray-800 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <HiX size={28} /> : <HiMenu size={28} />}
        </button>
      </nav>

      {/* Sidebar: no desktop, fica abaixo da barra do topo */}
      <aside
        className={`fixed md:static top-0 md:mt-[64px] left-0 bg-gray-900 text-white p-6 w-64 transform ${
          isSidebarOpen ? 'translate-x-0 h-full' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:w-1/5 md:translate-x-0 md:h-auto md:flex-shrink-0 z-50`}
      >
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-3">
            {[
              { href: '/dashboard/', label: '💻 Home' },
              { href: '/dashboard/pages/my-listings', label: '📌 My Listings' },
              { href: '/dashboard/pages/messages', label: '💬 Messages (Live Chat)' },
              { href: '/dashboard/pages/profile', label: '👤 Profile' },
              { href: '/dashboard/pages/settings', label: '⚙️ Settings' }
            ].map(({ href, label }) => (
              <li key={href}>
                <Link 
                  href={href} 
                  className="block hover:text-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Footer />
      </aside>

      {/* Overlay para escurecer fundo ao abrir menu no mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Área principal onde o conteúdo é renderizado, agora com espaço abaixo da navbar */}
      <main className="flex-1 p-8 mt-[64px] md:mt-[64px] md:ml-64 overflow-auto">
        {children}
      </main>
    </div>
  );
}
