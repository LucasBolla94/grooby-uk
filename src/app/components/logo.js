'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Logo() {
  const router = useRouter();

  return (
    <header className="w-full min-h-[80px] flex items-center justify-between px-6 bg-transparent">
      {/* Logo */}
      <div className="flex items-center">
        <Image 
          src="/logo.jpg" 
          alt="Logo" 
          width={150} 
          height={50} 
          className="cursor-pointer"
          onClick={() => router.push('/')} // Redireciona para a home ao clicar no logo
        />
      </div>

      {/* Botão "Make your Ads Free" */}
      <button 
        className="px-6 py-2 border border-black text-black rounded-full bg-transparent hover:bg-gray-200 transition"
        onClick={() => router.push('/ads-free')} // Ajuste a rota conforme necessário
      >
        Make your Ads Free
      </button>

      {/* Botão "Register" */}
      <button 
        className="px-6 py-2 border border-black text-black rounded-full bg-transparent hover:bg-gray-200 transition"
        onClick={() => router.push('/register')} // Ajuste a rota conforme necessário
      >
        Register
      </button>
    </header>
  );
}
