'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdDetailPage({ params }) {
  // Aguardando o params com React.use()
  const [adsId, setAdsId] = useState(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params; // Aguarda o params
      setAdsId(resolvedParams.adsId); // Define o adsId
    };

    fetchParams();
  }, [params]);

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adsId) {
      const fetchAd = async () => {
        try {
          const adRef = doc(db, 'ads-uk', adsId);
          const adSnap = await getDoc(adRef);
          if (adSnap.exists()) {
            const adData = adSnap.data();
            setAd(adData);

            // Verifica se o usuário já visualizou o anúncio recentemente (30 min)
            const lastViewTime = JSON.parse(localStorage.getItem(`viewedAd-${adsId}`)) || 0;
            const currentTime = Date.now();
            const timeDifference = (currentTime - lastViewTime) / (1000 * 60); // Minutos

            if (timeDifference > 30) {
              // Se passou mais de 30 min, conta como nova visualização
              await updateDoc(adRef, {
                views: increment(1),
                viewHistory: arrayUnion({ timestamp: new Date().toISOString() }),
              });

              // Salva o tempo da última visualização no localStorage
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

      // Verifica se o usuário já clicou em "Seller Details" recentemente (30 min)
      const lastDetailClickTime = JSON.parse(localStorage.getItem(`viewDetails-${adsId}`)) || 0;
      const currentTime = Date.now();
      const timeDifference = (currentTime - lastDetailClickTime) / (1000 * 60); // Minutos

      if (timeDifference > 30) {
        // Se passou mais de 30 min, registra o clique no Firestore
        await updateDoc(adRef, {
          contactClicks: increment(1),
          contactClickHistory: arrayUnion({ timestamp: new Date().toISOString() }),
          viewDetails: arrayUnion({ timestamp: new Date().toISOString() }), // Novo campo para rastrear detalhes
        });

        // Salva o tempo do clique no localStorage
        localStorage.setItem(`viewDetails-${adsId}`, JSON.stringify(currentTime));
      }

      // Redirecionar para a página do vendedor
      window.location.href = `/seller/${ad.userId}`;
    } catch (error) {
      console.error('Error updating contact click:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (!ad) {
    return <div className="text-center p-6 text-red-500">Ad not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg mt-10 rounded-md border border-gray-200">
      <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
      <h2 className="text-xl text-gray-600 mb-6">{ad.subtitle}</h2>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img
            src={ad.imageUrls[0]}
            alt={ad.title}
            className="w-full h-auto object-cover rounded-md"
          />
          <div className="flex mt-4 space-x-2 overflow-x-auto">
            {ad.imageUrls.slice(1).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${ad.title} ${index + 2}`}
                className="w-24 h-24 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </div>
        <div className="md:w-1/2 md:pl-6 mt-6 md:mt-0">
          <p className="text-lg font-semibold mb-2">Specifications:</p>
          <p className="mb-4">{ad.specs}</p>
          <p className="text-lg font-semibold mb-2">Description:</p>
          <p className="mb-4">{ad.description}</p>
          <p className="text-2xl font-bold mb-4">£{ad.price.toFixed(2)}</p>
          <button
            onClick={handleContactClick}
            className="w-full p-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition"
          >
            Seller Details
          </button>
        </div>
      </div>
    </div>
  );
}
