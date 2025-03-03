'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function HomePanel() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Memoiza a função listenToAdStats para que sua referência seja estável entre renderizações.
  const listenToAdStats = useCallback((userId) => {
    const adsRef = collection(db, 'ads-uk');
    const q = query(adsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let adData = [];

      querySnapshot.forEach((doc) => {
        const ad = doc.data();
        adData.push({
          id: doc.id,
          title: ad.title || 'No Title',
          views: ad.viewHistory?.length || 0,
          contactClicks: ad.viewDetails?.length || 0,
          timestamp: new Date().toLocaleTimeString(),
        });
      });

      setAds(adData);
      updateChartData(adData);
    });

    return unsubscribe;
  }, []);

  // Atualiza os dados do gráfico com base nos anúncios
  const updateChartData = (ads) => {
    const now = new Date();
    const formattedTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

    const newData = ads.map((ad) => ({
      time: formattedTime,
      views: ad.views,
      contactClicks: ad.contactClicks,
    }));

    // Mantém os dados dos últimos 10 minutos (exemplo: últimas 10 entradas)
    setChartData((prevData) => [...prevData.slice(-10), ...newData]);
  };

  // useEffect que lida com a autenticação e chama listenToAdStats quando o usuário está autenticado
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        listenToAdStats(currentUser.uid);
      } else {
        setUser(null);
        setAds([]);
        setChartData([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [auth, listenToAdStats]);

  if (loading)
    return <div className="text-center p-6 text-lg font-semibold">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-xl mt-10 rounded-lg border border-gray-300">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">
        📊 Your Ad Statistics
      </h1>

      {/* Tabela de Estatísticas */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-900 text-white text-lg">
              <th className="p-3 text-left">📌 Ad Title</th>
              <th className="p-3 text-center">👀 Views</th>
              <th className="p-3 text-center">📞 Contact Clicks</th>
            </tr>
          </thead>
          <tbody>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-300 hover:bg-gray-100 transition">
                  <td className="p-3 font-medium text-sm sm:text-base">{ad.title}</td>
                  <td className="p-3 text-center font-bold text-blue-600 text-lg">{ad.views}</td>
                  <td className="p-3 text-center font-bold text-green-600 text-lg">{ad.contactClicks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500 text-sm sm:text-base">
                  No ads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gráfico de Cliques por Minuto */}
      <div className="mt-6 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-900">
          📈 Ad Views & Seller Clicks (Last 10 Min)
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10, dy: 5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#1D4ED8"
                name="Ad Views"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="contactClicks"
                stroke="#16A34A"
                name="Seller Clicks"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No data available.</p>
        )}
      </div>

      {/* Botão de Ação */}
      <div className="text-center mt-8">
        <button className="px-5 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition shadow-lg text-sm sm:text-base">
          🔍 View All Ads
        </button>
      </div>
    </div>
  );
}
