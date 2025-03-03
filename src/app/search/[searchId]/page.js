'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const queryString = searchParams.toString(); // Obtém os parâmetros da URL
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-lg">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((ad) => (
            <Link key={ad.id} href={`/ads/${ad.id}`} className="block bg-white shadow-md rounded-md overflow-hidden">
              <Image
                src={ad.imageUrls?.[0] || '/placeholder.jpg'}
                alt={ad.description}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{ad.description}</h2>
                <p className="text-lg font-bold text-gray-800">£{ad.price}</p>
                <p className="text-sm text-gray-600">{ad.city}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
