'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Eye, PhoneCall, LineChart as ChartIcon } from 'lucide-react'; // Ícones Profissionais

// Componente customizado para desenhar o candle
// Se o valor for maior que zero, utiliza a cor (verde para clicks, azul para views), senão cinza com altura fixa.
const renderCandle = (props) => {
  const { x, y, width, height, payload, dataKey } = props;
  const value = payload[dataKey];
  const fill = value > 0 ? (dataKey === "views" ? "#1D4ED8" : "#16A34A") : "#A0A0A0";
  // Se não houver valor, candle pequeno (altura fixa de 5px)
  const candleHeight = value > 0 ? height : 5;
  const yPos = value > 0 ? y : y + height - 5;
  return <rect x={x} y={yPos} width={width} height={candleHeight} fill={fill} />;
};

export default function HomePanel() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Função para buscar estatísticas dos anúncios
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
          // Para fins de agrupamento, utiliza a data de criação do snapshot
          day: new Date().toLocaleString('default', { day: '2-digit' }),
        });
      });
      setAds(adData);
      updateChartData(adData);
    });

    return unsubscribe;
  }, []);

  // Atualiza os dados do gráfico para exibição diária (candlestick) para o mês corrente
  const updateChartData = (adData) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Inicializa os dados para cada dia do mês com clicks e views zerados
    const dailyData = {};
    for (let d = 1; d <= totalDays; d++) {
      const dayStr = d.toString().padStart(2, '0');
      dailyData[dayStr] = { day: dayStr, clicks: 0, views: 0 };
    }

    // Agrupa os anúncios por dia: soma os cliques e as views de cada anúncio no dia correspondente
    adData.forEach((ad) => {
      const day = ad.day;
      if (dailyData[day]) {
        dailyData[day].clicks += ad.contactClicks;
        dailyData[day].views += ad.views;
      }
    });

    // Converte em array e ordena por dia
    const sortedData = Object.values(dailyData).sort((a, b) => Number(a.day) - Number(b.day));
    setChartData(sortedData);
  };

  // useEffect que lida com autenticação e estatísticas dos anúncios
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold text-gray-700">
        ⏳ Loading, please wait...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Título Principal */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 flex items-center justify-center gap-2">
        <ChartIcon size={28} strokeWidth={2.2} /> Your Ad Statistics
      </h1>

      {/* Tabela de Estatísticas */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-300 mb-8">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="sticky top-0 bg-gray-900 text-white text-sm sm:text-base">
            <tr>
              <th className="p-3 text-left min-w-[250px]">📌 Ad Title</th>
              <th className="p-3 text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-2">
                  <Eye size={16} /> Views
                </div>
              </th>
              <th className="p-3 text-center min-w-[150px]">
                <div className="flex items-center justify-center gap-2">
                  <PhoneCall size={16} /> Contact Clicks
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {ads.length > 0 ? (
              ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-300 hover:bg-gray-100 transition">
                  <td className="p-4 font-medium text-sm sm:text-base">{ad.title}</td>
                  <td className="p-4 text-center font-bold text-blue-600 text-base sm:text-lg">{ad.views}</td>
                  <td className="p-4 text-center font-bold text-green-600 text-base sm:text-lg">{ad.contactClicks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500 text-sm sm:text-base">
                  ❌ No ads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gráfico Candle Diário */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 flex items-center justify-center gap-2">
          📈 Daily Candles (This Month)
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Candle para Contact Clicks */}
              <Bar dataKey="clicks" name="Contact Clicks" fill="#16A34A" shape={(props) => renderCandle({ ...props, dataKey: "clicks" })} />
              {/* Candle para Views */}
              <Bar dataKey="views" name="Ad Views" fill="#1D4ED8" shape={(props) => renderCandle({ ...props, dataKey: "views" })} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">⚠ No data available</p>
        )}
      </div>

      {/* Botão de Ação */}
      <div className="text-center mt-8">
        <button className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition shadow-md text-base">
          🔍 View All Ads
        </button>
      </div>
    </div>
  );
}
