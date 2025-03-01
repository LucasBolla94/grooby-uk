'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';

const Banner = () => {
  return (
    <div className="p-6 bg-gray-200 text-center text-xl font-semibold">
      Welcome to Grooby - Find what you need in the UK!
    </div>
  );
};

const ListingsSection = ({ title, listings = [], onScroll }) => {
  const containerRef = useRef(null);
  const router = useRouter();

  const handleListingClick = (listingId) => {
    if (!listingId) return;
    router.push(`/ads/${listingId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div
        ref={containerRef}
        className="flex overflow-x-scroll space-x-4 p-2 scrollbar-hidden"
        onScroll={onScroll}
      >
        {listings.length > 0 ? (
          listings.map((listing, i) => (
            <div
              key={listing.id || i}
              className="w-60 flex flex-col p-3 cursor-pointer bg-transparent shadow-md rounded-md transition hover:shadow-lg"
              onClick={() => handleListingClick(listing.id)}
            >
              <img
                src={listing.imageUrl || 'https://via.placeholder.com/150'}
                alt={listing.title}
                className="w-full h-40 object-cover rounded-md"
              />
              <div className="mt-2">
                <h3 className="text-lg font-semibold text-left">{listing.title || `Listing ${i + 1}`}</h3>
                <p className="text-sm text-gray-600 text-left">{listing.subtitle || 'No subtitle available'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center w-full">No listings found</p>
        )}
      </div>
    </div>
  );
};

// ⬇️ O footer agora está colado no final da página
const Footer = () => {
  return (
    <footer className="w-full p-6 bg-gray-800 text-white text-center mt-auto">
      © 2025 Grooby - All rights reserved
    </footer>
  );
};

export default function Home() {
  const [mostViewed, setMostViewed] = useState([]);
  const [latestListings, setLatestListings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchListings('most-viewed', setMostViewed);
    fetchListings('latest', setLatestListings);
  }, []);

  const fetchListings = async (type, setListings) => {
    try {
      const response = await fetch(`/api/listings?type=${type}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error(`Error fetching ${type} listings:`, error);
      setListings([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onSearch={setSearchResults} />
      <div className="flex-grow">
        <Banner />
        {searchResults.length > 0 ? (
          <ListingsSection title="Search Results" listings={searchResults} />
        ) : (
          <>
            <ListingsSection title="Most Viewed Listings" listings={mostViewed} />
            <ListingsSection title="Latest Listings" listings={latestListings} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
