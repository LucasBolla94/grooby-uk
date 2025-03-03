'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function AdDetailPage({ params }) {
  const router = useRouter();
  const [adsId, setAdsId] = useState(null);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setAdsId(resolvedParams.adsId);
    };

    fetchParams();
  }, [params]);

  useEffect(() => {
    if (adsId) {
      const fetchAd = async () => {
        try {
          const adRef = doc(db, 'ads-uk', adsId);
          const adSnap = await getDoc(adRef);
          if (adSnap.exists()) {
            const adData = adSnap.data();
            setAd(adData);

            const lastViewTime = JSON.parse(localStorage.getItem(`viewedAd-${adsId}`)) || 0;
            const currentTime = Date.now();
            const timeDifference = (currentTime - lastViewTime) / (1000 * 60);

            if (timeDifference > 30) {
              await updateDoc(adRef, {
                views: increment(1),
                viewHistory: arrayUnion({ timestamp: new Date().toISOString() }),
              });

              localStorage.setItem(`viewedAd-${adsId}`, JSON.stringify(currentTime));
            }
          } else {
            console.error('No such document!');
          }
        } catch (error) {
          console.error('Error fetching ad:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAd();
    }
  }, [adsId]);

  const handleContactClick = async () => {
    if (!ad) return;

    try {
      const adRef = doc(db, 'ads-uk', adsId);

      const lastDetailClickTime = JSON.parse(localStorage.getItem(`viewDetails-${adsId}`)) || 0;
      const currentTime = Date.now();
      const timeDifference = (currentTime - lastDetailClickTime) / (1000 * 60);

      if (timeDifference > 30) {
        await updateDoc(adRef, {
          contactClicks: increment(1),
          contactClickHistory: arrayUnion({ timestamp: new Date().toISOString() }),
          viewDetails: arrayUnion({ timestamp: new Date().toISOString() }),
        });

        localStorage.setItem(`viewDetails-${adsId}`, JSON.stringify(currentTime));
      }

      router.push(`/sellerdetails/${adsId}`);
    } catch (error) {
      console.error('Error updating contact click:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-lg font-semibold">Loading...</div>;
  }

  if (!ad) {
    return <div className="text-center p-6 text-red-500 text-lg font-semibold">Ad not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Título e preço */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{ad.title}</h1>
        <p className="text-3xl font-bold text-blue-600">£{ad.price.toFixed(2)}</p>
      </div>

      {/* Galeria de imagens */}
      <div className="relative w-full h-[350px] md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={ad.imageUrls[currentImage]}
          alt={`Product image ${currentImage + 1}`}
          width={600}
          height={500}
          className="w-full h-full object-contain"
        />

        {/* Setas de navegação */}
        <button
          onClick={() => setCurrentImage((prev) => (prev - 1 + ad.imageUrls.length) % ad.imageUrls.length)}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black transition"
        >
          ◀
        </button>
        <button
          onClick={() => setCurrentImage((prev) => (prev + 1) % ad.imageUrls.length)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black transition"
        >
          ▶
        </button>
      </div>

      {/* Miniaturas */}
      <div className="flex mt-4 space-x-2 overflow-x-auto scrollbar-hide">
        {ad.imageUrls.map((url, index) => (
          <Image
            key={index}
            src={url}
            alt={`Thumbnail ${index + 1}`}
            width={80}
            height={80}
            className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
              currentImage === index ? 'border-blue-500' : 'border-gray-300'
            }`}
            onClick={() => setCurrentImage(index)}
          />
        ))}
      </div>

      {/* Detalhes do produto */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Specifications</h2>
        <p className="text-gray-700 mb-4">{ad.specs || 'No specifications provided.'}</p>

        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700">{ad.description}</p>
      </div>

      {/* Botão de contato */}
      <button
        onClick={handleContactClick}
        className="mt-6 w-full md:w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition text-lg"
      >
        Contact Seller
      </button>
    </div>
  );
}
