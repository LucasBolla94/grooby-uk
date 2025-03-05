'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from './components/logo';
import Footer from './components/footer';

// Fixed definition outside the component to avoid unnecessary re-creations
const PROPERTY_OPTIONS = {
  Buy: ['Homes'],
  Rent: ['Rooms', 'Homes']
};

export default function Home() {
  const router = useRouter();
  const [buyOrRent, setBuyOrRent] = useState('Rent'); 
  const [propertyType, setPropertyType] = useState(PROPERTY_OPTIONS['Rent'][0]);
  const [cities, setCities] = useState(null); // null indicates loading
  const [selectedCity, setSelectedCity] = useState('');

  // Update propertyType when buyOrRent changes
  useEffect(() => {
    setPropertyType(PROPERTY_OPTIONS[buyOrRent][0]);
  }, [buyOrRent]);

  // Fetch cities from the backend
  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await fetch('/api/ads-uk-cities');
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        setCities(data.cities || []);

        if (data.cities?.length) {
          setSelectedCity(data.cities[0].name);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]); // Set an empty array in case of an error
      }
    }
    fetchCities();
  }, []);

  // Redirect to the results page
  const handleSearch = () => {
    router.push(`/search/results?transaction=${buyOrRent}&type=${propertyType}&city=${selectedCity}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Fixed navbar at the top */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Logo />
      </nav>

      {/* Main content */}
      <main className="flex-grow flex flex-col justify-center items-center min-h-screen pt-16">
        <div
          className="w-full flex flex-col items-center justify-center p-6 min-h-[500px] bg-cover bg-center rounded-lg shadow-lg"
          style={{ backgroundImage: 'url(/bg.jpg)' }}
        >
          {/* Search form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="w-full max-w-4xl bg-white/90 backdrop-blur-lg p-6 rounded-lg shadow-xl"
          >
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
              Find Your Perfect Property
            </h1>
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
                  {PROPERTY_OPTIONS[buyOrRent].map((option) => (
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
                  disabled={!cities}
                  aria-live="polite"
                >
                  {cities === null ? (
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

              {/* Search button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-black transition-all focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                  disabled={!cities}
                >
                  {cities === null ? 'Loading...' : '🔍 Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
