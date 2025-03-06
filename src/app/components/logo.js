'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth'; // Importa a autenticação

export default function Logo() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Verifica se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  // Detecta se a tela é mobile (largura menor que 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Oculta a header quando o usuário faz scroll down em mobile,
  // e só a mostra novamente quando estiver no topo (scrollY <= 10)
  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => {
      if (window.pageYOffset <= 10) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <header
      className={`w-full ${isMobile ? 'fixed top-0 left-0 right-0 z-50 transition-transform duration-300' : ''} flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-white shadow-md border-b border-gray-200 ${
        isMobile && !showHeader ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Logo (Texto "Grooby") */}
      <div 
        className="text-3xl font-extrabold text-gray-900 cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => router.push('/')}
      >
        Grooby
      </div>

      {/* Botões responsivos */}
      <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
        
        {/* Botão "Make your Ads Free" */}
        <button 
          className="px-6 py-2 text-sm sm:text-base font-medium border border-gray-800 text-gray-900 rounded-full bg-transparent hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          onClick={() => {
            if (!user) {
              router.push('/register/');
            } else {
              router.push('/createads');
            }
          }}
        >
          🚀 Make your Ads Free
        </button>

        {/* Botão "Register" ou "Dashboard" */}
        <button 
          className="px-6 py-2 text-sm sm:text-base font-medium border border-gray-800 text-gray-900 rounded-full bg-transparent hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          onClick={() => router.push(user ? '/dashboard/' : '/register')}
        >
          {user ? '📊 Dashboard' : '🔑 Register/Login'}
        </button>

      </div>
    </header>
  );
}
