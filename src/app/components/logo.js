'use client';

import { useRouter } from 'next/navigation';

export default function Logo() {
  const router = useRouter();

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
        
        <button 
          className="px-6 py-2 text-sm sm:text-base font-medium border border-gray-800 text-gray-900 rounded-full bg-white hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
          onClick={() => router.push('/ads-free')}
        >
          🚀 Make your Ads Free
        </button>

        <button 
          className="px-6 py-2 text-sm sm:text-base font-medium text-white rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md"
          onClick={() => router.push('/register')}
        >
          🔑 Register
        </button>

      </div>
    </header>
  );
}
