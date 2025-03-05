'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaTag, FaInfoCircle } from 'react-icons/fa';
import Logo from '../../components/logo';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  // Função para buscar resultados (aceita cursor para paginação)
  const fetchResults = useCallback(async (cursor = null) => {
    setLoading(true);
    try {
      // Constrói os parâmetros da query
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has('limit')) {
        params.set('limit', '15');
      }
      if (cursor) {
        params.set('cursor', cursor);
      }
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching search results:', error);
      return { results: [], nextCursor: null };
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Carrega os resultados iniciais
  useEffect(() => {
    async function loadInitial() {
      const data = await fetchResults();
      setResults(data.results || []);
      setNextCursor(data.nextCursor);
    }
    if (searchParams) {
      loadInitial();
    }
  }, [searchParams, fetchResults]);

  // Configura o IntersectionObserver para paginação infinita
  useEffect(() => {
    if (!nextCursor) return; // Não há mais resultados
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const data = await fetchResults(nextCursor);
          setResults(prev => [...prev, ...(data.results || [])]);
          setNextCursor(data.nextCursor);
          setLoadingMore(false);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [nextCursor, fetchResults, loadingMore]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar fixa */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow z-50">
        <div className="max-w-7xl mx-auto px-4">
          <Logo />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          🔍 Search Results
        </h1>

        {loading && results.length === 0 ? (
          <div className="flex justify-center items-center">
            <p className="text-xl text-gray-700">Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex justify-center items-center">
            <p className="text-xl text-gray-700">No results found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((ad) => (
              <Link
                key={ad.id}
                href={`/ads/${ad.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
              >
                {/* Imagem do anúncio */}
                <div className="relative h-56">
                  <Image
                    src={ad.imageUrls?.[0] || '/placeholder.jpg'}
                    alt={ad.description || 'Property image'}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Conteúdo do anúncio */}
                <div className="p-4 flex flex-col justify-between h-full">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-2">
                    <FaInfoCircle className="text-gray-500 mr-2" />
                    {ad.description}
                  </h2>
                  <div className="flex items-center mb-2">
                    <FaTag className="text-gray-500 mr-2" />
                    <span className="text-lg font-bold text-blue-600">
                      £{ad.price}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">{ad.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sentinel para carregar mais */}
        {nextCursor && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center items-center">
            {loadingMore && <p className="text-lg text-gray-700">Loading more...</p>}
          </div>
        )}
      </main>
    </div>
  );
}
