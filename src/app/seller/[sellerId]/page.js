'use client';

import React, { useEffect, useState } from 'react';  // Ensure React is imported
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image'; // Importando o componente Image do Next.js

export default function SellerPage({ params }) {
  const [sellerId, setSellerId] = useState(null);

  // Unwrap params using React.use() for future-proofing
  useEffect(() => {
    const fetchParams = async () => {
      const { sellerId } = await params; // Unwrap the Promise to get the sellerId
      setSellerId(sellerId);
    };
    fetchParams();
  }, [params]);

  const [sellerAds, setSellerAds] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        // Fetch seller information from Firestore
        const sellerRef = doc(db, 'users-uk', sellerId);
        const sellerSnap = await getDoc(sellerRef);

        if (sellerSnap.exists()) {
          setSellerInfo(sellerSnap.data());
        } else {
          console.error('Seller not found');
        }
      } catch (error) {
        console.error('Error fetching seller info:', error);
      }
    };

    const fetchSellerAds = async () => {
      try {
        // Fetch all ads for the seller
        const q = query(collection(db, 'ads-uk'), where('userId', '==', sellerId));
        const querySnapshot = await getDocs(q);
        const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setSellerAds(ads);
      } catch (error) {
        console.error('Error fetching seller ads:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerInfo();
      fetchSellerAds();
    }
  }, [sellerId]);

  const filteredAds = sellerAds.filter(ad =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-6">Loading seller&apos;s products...</div>;
  }

  if (!sellerInfo) {
    return <div className="text-center p-6 text-red-500">Seller not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-6">
      {/* Store Cover */}
      <div className="relative w-full h-52 bg-gray-300 rounded-lg overflow-hidden">
        <Image
          src={sellerInfo.coverPhoto || '/default-cover.jpg'}
          alt="Store Cover"
          width={800}
          height={208}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Seller Info */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg -mt-16 flex flex-col items-center text-center">
        <Image
          src={sellerInfo.profilePicture || '/default-profile.png'}
          alt="Profile"
          width={112}
          height={112}
          className="rounded-full border-4 border-white shadow-lg"
        />
        <h1 className="text-2xl font-bold mt-3">{sellerInfo.storeName || 'Seller Name'}</h1>
        <p className="text-gray-600">{sellerInfo.sellerLevel || 'Basic Seller'}</p>
        <p className="mt-2 text-sm text-gray-500">⭐ {sellerInfo.feedback || 0} Feedback</p>
      </div>

      {/* Search Bar */}
      <div className="mt-6 px-4">
        <input
          type="text"
          placeholder="Search seller&apos;s products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Ads List */}
      <div className="mt-6 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.length > 0 ? (
          filteredAds.map(ad => (
            <div
              key={ad.id}
              className="shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => window.location.href = `/ads/${ad.id}`}
            >
              <Image
                src={ad.imageUrls[0] || '/default-image.jpg'}
                alt={ad.title}
                width={800}
                height={400}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-bold truncate">{ad.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{ad.category}</p>
                <p className="text-xl font-bold mt-2">£{ad.price.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No products found.</p>
        )}
      </div>
    </div>
  );
}
