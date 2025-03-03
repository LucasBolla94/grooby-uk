'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Logo from './components/logo';
import Footer from './components/footer';
import Image from 'next/image';

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
          setLoadingCities(false);
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
    <div className="flex flex-col min-h-screen bg-transparent text-white">
      <Logo />
      <div className="flex-grow">
        <div
          className="flex flex-col items-center justify-center px-6 py-32 min-h-[500px]"
          style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Formulário de busca */}
          <form onSubmit={handleSubmit} className="w-full max-w-4xl">
            <div className="flex flex-col md:flex-row items-center w-full bg-white/50 backdrop-blur-md p-6 rounded-lg shadow-lg space-y-4 md:space-y-0 md:space-x-4">
              {/* Buy/Rent */}
              <div className="w-full md:w-1/4">
                <label className="text-black text-md font-light mb-1 block">
                  Buy/Rent
                </label>
                <select
                  className="w-full p-3 bg-transparent border border-gray-700 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                  value={buyOrRent}
                  onChange={(e) => setBuyOrRent(e.target.value)}
                >
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="w-full md:w-1/4">
                <label className="text-black text-md font-light mb-1 block">
                  Property Type
                </label>
                <select
                  className="w-full p-3 bg-transparent border border-gray-700 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
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
              <div className="w-full md:w-1/4">
                <label className="text-black text-md font-light mb-1 block">
                  City
                </label>
                <select
                  className="w-full p-3 bg-transparent border border-gray-700 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
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
              <div className="w-full md:w-1/4">
                <button
                  type="submit"
                  className="w-full p-3 bg-transparent text-black border border-gray-700 font-semibold rounded-full hover:from-black hover:to-gray-700 transition-all focus:ring-2 focus:ring-gray-600"
                  disabled={loadingCities}
                >
                  {loadingCities ? 'Loading...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
