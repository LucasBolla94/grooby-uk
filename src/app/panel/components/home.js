'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function HomePanel() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        listenToAdStats(currentUser.uid);
      } else {
        setUser(null);
        setAds([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth]); // Adicionando 'auth' como dependência

  const listenToAdStats = (userId) => {
    const adsRef = collection(db, 'ads-uk');
    const q = query(adsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let adData = [];

      querySnapshot.forEach((doc) => {
        const ad = doc.data();
        adData.push({
          id: doc.id,
          title: ad.title || "No Title",
          views: ad.views || 0,
          contactClicks: ad.contactClicks || 0,
        });
      });

      setAds(adData);
    });

    return unsubscribe;
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg mt-10 rounded-lg border border-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Your Ad Statistics (Live Updates)</h1>

      {/* Tabela de estatísticas dos anúncios */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-black text-white text-lg">
              <th className="p-4 text-left">Ad Title</th>
              <th className="p-4 text-center">Total Views</th>
              <th className="p-4 text-center">Clicks on Seller Details</th>
            </tr>
          </thead>
          <tbody>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-300 hover:bg-gray-100 transition">
                  <td className="p-4 font-medium">{ad.title}</td>
                  <td className="p-4 text-center font-bold text-blue-600 text-lg">{ad.viewHistory}</td>
                  <td className="p-4 text-center font-bold text-green-600 text-lg">{ad.viewDetails}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No ads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gráfico de Cliques Atualizado em Tempo Real */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Ad Views & Seller Details Clicks (Live)</h2>
        {ads.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ads}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#1D4ED8" name="Ad Views" strokeWidth={2} />
              <Line type="monotone" dataKey="contactClicks" stroke="#16A34A" name="Seller Details Clicks" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No click data available.</p>
        )}
      </div>

      {/* Botão de Ação */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition">
          View All Ads
        </button>
      </div>
    </div>
  );
}
