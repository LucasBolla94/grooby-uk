'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '../../lib/firebase';  // Verifique o caminho correto do seu arquivo de autenticação
import { onAuthStateChanged } from 'firebase/auth';
import { FiMenu, FiX } from 'react-icons/fi'; // Ícones para responsividade

const Navbar = ({ onSearch }) => {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para o menu mobile

  useEffect(() => {
    // Verifica se estamos no ambiente do navegador (lado do cliente)
    if (typeof window !== 'undefined') {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user); // Atualiza o estado com o usuário autenticado
        } else {
          setUser(null); // Limpa o estado caso o usuário saia
        }
      });
      return () => unsubscribe(); // Limpeza da assinatura quando o componente for desmontado
    }
  }, []);

  // Função para buscar as cidades
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities'); // API de cidades
        const data = await response.json();
        setCities(data.cities);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      }
    };
    fetchCities();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await fetch(`/api/listings?type=search&query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      onSearch(data.listings); // Passa os resultados para o componente pai
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex items-center justify-between z-50">
      {/* Left - Logo */}
      <Link href="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
        Grooby
      </Link>

      {/* Mobile Menu Button */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl text-gray-700">
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Center - Search Bar (Responsivo) */}
      <div className="hidden md:flex items-center space-x-2 w-full max-w-2xl">
        <input
          type="text"
          placeholder="What are you looking for?"
          className="p-2 border border-gray-300 rounded-md flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="p-2 border border-gray-300 rounded-md"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Select a city</option>
          {cities.map(city => (
            <option key={city.id} value={city.name}>{city.name}</option>
          ))}
        </select>
        <button onClick={handleSearch} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Search
        </button>
      </div>

      {/* Right - Buttons */}
      <div className="hidden md:flex space-x-2">
        {user ? (
          <Link href="/panel">
            <button className="p-2 border-2 border-black text-black rounded-full bg-transparent hover:bg-gray-200 hover:text-black transition">Dashboard</button>
          </Link>
        ) : (
          <Link href="/register">
            <button className="p-2 border-2 border-black text-black rounded-full bg-transparent hover:bg-gray-200 hover:text-black transition">Register</button>
          </Link>
        )}
        <Link href="/createads">
          <button className="p-2 border-2 border-black text-black rounded-full bg-transparent  hover:bg-gray-200 hover:text-black transition">Ads Free</button>
        </Link>
      </div>

      {/* Mobile Menu (Visível apenas quando aberto) */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-center space-y-4 p-4 md:hidden">
          {/* Search bar no mobile */}
          <div className="w-full flex flex-col space-y-2">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="p-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="p-2 border border-gray-300 rounded-md w-full"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Select a city</option>
              {cities.map(city => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
            <button onClick={handleSearch} className="p-2 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700 transition">
              Search
            </button>
          </div>

          {/* Botões de login/painel no mobile */}
          <div className="flex flex-col space-y-2 w-full">
            {user ? (
              <Link href="/panel">
                <button className="p-2 bg-black text-white rounded-md w-full hover:bg-gray-900 transition">Dashboard</button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="p-2 bg-black text-white rounded-md w-full hover:bg-gray-900 transition">Login</button>
              </Link>
            )}
            <Link href="/createads">
              <button className="p-2 bg-gray-700 text-white rounded-md w-full hover:bg-gray-800 transition">Ads Free</button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
