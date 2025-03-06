'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/logo';
import Footer from '../components/footer';
import { HiMenu, HiX } from 'react-icons/hi';
import { logout } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Bloqueia o scroll do body quando o menu estiver aberto no mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSidebarOpen]);

  // Função para tratar o logout e redirecionar para a página principal
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header para Mobile */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md flex items-center justify-between py-2 px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="relative z-100 text-gray-800 focus:outline-none"
          aria-label="Toggle Menu"
          aria-expanded={isSidebarOpen ? "true" : "false"}
        >
          {isSidebarOpen ? <HiX size={28} /> : <HiMenu size={28} />}
        </button>
        <Logo />
        {/* Elemento vazio para centralizar o logo */}
        <div className="w-7" />
      </header>

      {/* Header para Desktop */}
      <header className="hidden md:flex flex-col">
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md flex items-center justify-center py-2">
          <Logo />
        </div>
        <nav className="fixed top-[50px] left-0 w-full bg-white shadow-md z-40 px-4 py-3 flex items-center justify-between">
          {/* Itens adicionais do navbar podem ser adicionados aqui */}
        </nav>
      </header>

      <div className="flex flex-1 mt-[56px] md:mt-[100px]">
        {/* Sidebar */}
        <aside
          className={`bg-gray-900 text-white p-6 w-64 fixed md:relative top-[56px] md:top-0 left-0 h-full md:h-auto z-50 transition-transform duration-300 ease-in-out flex flex-col justify-between overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
          aria-label="Sidebar Navigation"
        >
          <div className="flex-grow">
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>
            <nav>
              <ul className="space-y-3">
                {[
                  { href: '/dashboard/', label: '💻 Home' },
                  { href: '/dashboard/pages/my-listings', label: '📌 My Listings' },
                  { href: '/dashboard/pages/messages', label: '💬 Messages' },
                  { href: '/dashboard/pages/profile', label: '👤 Profile' },
                  { href: '/dashboard/pages/help', label: '📩 Help' },
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
          </div>

          {/* Botão de Logout */}
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Overlay para mobile quando o sidebar estiver aberto */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Área principal onde o conteúdo é renderizado */}
        <main className="flex-1 p-4 md:p-8 overflow-auto mb-[56px] md:ml-64">
          {children}
        </main>
      </div>

      {/* Footer fixo */}
      <footer className="fixed bottom-0 left-0 w-full h-[56px] bg-white shadow-md z-50 flex items-center justify-center">
        <Footer />
      </footer>
    </div>
  );
}
