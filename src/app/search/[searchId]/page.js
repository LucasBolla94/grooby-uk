'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaTag, FaInfoCircle } from 'react-icons/fa';
import Logo from '../../components/logo'; // Importando a barra de navegação fixa

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const queryString = searchParams.toString();
        const response = await fetch(`/api/search?${queryString}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    }

    if (searchParams) fetchResults();
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      
      {/* Navbar fixa no topo */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Logo />
      </nav>

      {/* Espaçamento para evitar sobreposição da Navbar */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-6 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          🔍 Search Results
        </h1>

        {loading ? (
          <p className="text-center text-lg text-gray-700">Loading...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-lg text-gray-700">No results found.</p>
        ) : (
          <div className="space-y-6">
            {results.map((ad) => (
              <Link
                key={ad.id}
                href={`/ads/${ad.id}`}
                className="flex flex-col sm:flex-row bg-white shadow-md rounded-lg overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Imagem */}
                <div className="sm:w-48 flex-shrink-0">
                  <Image
                    src={ad.imageUrls?.[0] || '/placeholder.jpg'}
                    alt={ad.description}
                    width={192}
                    height={192}
                    className="w-full h-48 sm:h-full object-cover"
                  />
                </div>

                {/* Conteúdo do anúncio */}
                <div className="flex flex-col justify-between p-4 w-full">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FaInfoCircle className="text-gray-500 mr-2" />
                    {ad.description}
                  </h2>

                  <p className="text-lg font-bold text-blue-600 flex items-center mt-2">
                    <FaTag className="text-gray-500 mr-2" />
                    £{ad.price}
                  </p>

                  <p className="text-sm text-gray-600 flex items-center mt-2">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    {ad.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
