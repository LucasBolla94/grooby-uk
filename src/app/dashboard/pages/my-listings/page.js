'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Obtém o usuário logado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setError('User not logged in');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Função para buscar os anúncios do usuário logado
  const fetchListings = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/dashboard-listing?uId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Função para alternar o status do anúncio
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch('/api/edit-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          id: id,
          data: { status: newStatus }
        })
      });
      const result = await res.json();
      if (result.success) {
        fetchListings();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Error toggling status');
    }
  };

  // Função para deletar o anúncio com confirmação
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete your ad?");
    if (!confirmed) return;
    try {
      const res = await fetch('/api/edit-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await res.json();
      if (result.success) {
        fetchListings();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Error deleting listing');
    }
  };

  // Função para determinar o status a ser exibido com base nas propriedades do anúncio
  const getListingStatus = (listing) => {
    if (
      listing.checked === true &&
      listing.suspend === false &&
      listing.status === true &&
      listing.expired === true
    ) {
      return "Expired";
    } else if (listing.checked === true && listing.suspend === true) {
      return "Suspend";
    } else if (
      listing.checked === false &&
      listing.suspend === false &&
      listing.status === true
    ) {
      return "Pending";
    } else if (
      listing.checked === true &&
      listing.suspend === false &&
      listing.status === true
    ) {
      return "Activated";
    } else {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-xl text-gray-700">Loading listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📌 My Listings</h1>
      {listings.length === 0 ? (
        <p className="text-xl text-gray-700">No listings found.</p>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white shadow rounded p-4 flex flex-col sm:flex-row items-center"
            >
              <div className="relative w-20 h-20 flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                <Image
                  src={
                    (Array.isArray(listing.images)
                      ? listing.images[0]
                      : listing.images) || '/placeholder.jpg'
                  }
                  alt={listing.title || 'Listing Image'}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                <h2 className="text-xl font-bold">{listing.title}</h2>
                <p>
                  Status:{' '}
                  <span className="font-semibold text-black">
                    {getListingStatus(listing)}
                  </span>
                </p>
                <p>
                  Views: {listing.views || 0} | Messages: {listing.messages || 0}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link href={`/dashboard/pages/edit-ads/${listing.id}`}>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => toggleStatus(listing.id, listing.status)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                >
                  {listing.status ? "Pause" : "Active"}
                </button>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
