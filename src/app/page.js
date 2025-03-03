'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Logo from './components/logo';
import Footer from './components/footer';

export default function Home() {
  const router = useRouter();
  const [buyOrRent, setBuyOrRent] = useState('Buy'); 
  const [propertyType, setPropertyType] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingCities, setLoadingCities] = useState(true);

  // Memoiza as opções de propriedade para evitar re-criação do objeto em cada renderização
  const propertyOptions = useMemo(() => ({
    Buy: ['Homes'],
    Rent: ['Homes', 'Rooms']
  }), []);

  // Atualiza o propertyType quando o buyOrRent muda
  useEffect(() => {
    setPropertyType(propertyOptions[buyOrRent][0]);
  }, [buyOrRent, propertyOptions]);

  // Busca as cidades do backend
  useEffect(() => {
    async function fetchCities() {
      try {
        setLoadingCities(true);
        const response = await fetch('/api/ads-uk-cities');
        if (!response.ok) {
          console.error(`Erro na API: ${response.status}`);
          return;
        }
        const data = await response.json();
        setCities(data.cities || []);
        if (data.cities && data.cities.length > 0) {
          setSelectedCity(data.cities[0].name);
        }
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      } finally {
        setLoadingCities(false);
      }
    }
    fetchCities();
  }, []);

  // Redireciona para a página de resultados
  const handleSearch = () => {
    router.push(
      `/search/results?transaction=${buyOrRent}&type=${propertyType}&city=${selectedCity}`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar fixa no topo */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Logo />
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-grow flex flex-col justify-center items-center min-h-screen pt-16">
        <div
          className="w-full flex flex-col items-center justify-center p-6 min-h-[500px] bg-cover bg-center rounded-lg shadow-lg"
          style={{ backgroundImage: 'url(/bg.jpg)' }}
        >
          {/* Formulário de busca */}
          <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white/80 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Find Your Perfect Property</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Buy/Rent */}
              <div>
                <label className="text-gray-700 text-sm font-medium block">Buy/Rent</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={buyOrRent}
                  onChange={(e) => setBuyOrRent(e.target.value)}
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="text-gray-700 text-sm font-medium block">Property Type</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  {propertyOptions[buyOrRent].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="text-gray-700 text-sm font-medium block">City</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={loadingCities}
                >
                  {loadingCities ? (
                    <option>Loading cities...</option>
                  ) : cities.length > 0 ? (
                    cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))
                  ) : (
                    <option>No cities available</option>
                  )}
                </select>
              </div>

              {/* Botão Search */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all focus:ring-2 focus:ring-blue-400"
                  disabled={loadingCities}
                >
                  {loadingCities ? 'Loading...' : '🔍 Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}
