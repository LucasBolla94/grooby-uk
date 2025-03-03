'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth'; // Importa a autenticação

export default function Logo() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Verifica se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-white shadow-md border-b border-gray-200">
      
      {/* Logo (Texto "Grooby") */}
      <div 
        className="text-3xl font-extrabold text-gray-900 cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={() => router.push('/')} // Redireciona para a home ao clicar
      >
        Grooby
      </div>

      {/* Botões responsivos */}
      <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
        
        {/* Botão "Make your Ads Free" */}
        <button 
          className="px-6 py-2 text-sm sm:text-base font-medium border border-gray-800 text-gray-900 rounded-full bg-transparent hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          onClick={() => router.push('/ads-free')}
        >
          🚀 Make your Ads Free
        </button>

        {/* Botão "Register" ou "Dashboard" */}
        <button 
          className="px-6 py-2 text-sm sm:text-base font-medium border border-gray-800 text-gray-900 rounded-full bg-transparent hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          onClick={() => router.push(user ? '/panel/' : '/register')}
        >
          {user ? '📊 Dashboard' : '🔑 Register'}
        </button>

      </div>
    </header>
  );
}
