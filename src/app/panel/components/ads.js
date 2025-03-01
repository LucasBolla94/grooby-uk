'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Importando o componente Image do Next.js

export default function AdsPanel() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, adId: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔍 Verificando autenticação...', currentUser);

      if (currentUser) {
        setUser(currentUser);
        console.log('✅ Usuário autenticado:', currentUser.email);
        await fetchUserAds(currentUser);
      } else {
        console.log('🚫 Nenhum usuário autenticado.');
        setAds([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]); // Adicionando 'auth' como dependência

  const fetchUserAds = async (currentUser) => {
    if (!currentUser) {
      console.error('❌ Erro: Nenhum usuário logado.');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      console.log('🔑 Token gerado:', token);

      const response = await fetch('/api/ads/user', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📡 API Response:', response);

      if (!response.ok) throw new Error('❌ Falha ao buscar anúncios');

      const data = await response.json();
      console.log('📦 Dados da API:', data);

      setAds(data.ads || []);
    } catch (error) {
      console.error('🚨 Erro ao buscar anúncios:', error);
    }
  };

  const handleEdit = (adId) => {
    router.push(`/ads/edit/${adId}`);
  };

  const handleDelete = async () => {
    if (!deleteModal.adId || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/ads/${deleteModal.adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('❌ Falha ao excluir anúncio');

      setAds(ads.filter((ad) => ad.id !== deleteModal.adId));
      setDeleteModal({ show: false, adId: null });
    } catch (error) {
      console.error('🚨 Erro ao excluir anúncio:', error);
    }
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg mt-10 rounded-lg border border-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Your Ads</h1>

      {ads.length === 0 ? (
        <p className="text-center text-gray-600">You haven't created any ads yet.</p>
      ) : (
        <div className="space-y-6">
          {ads.map((ad) => {
            const status = ad.status || 'unknown';
            return (
              <div
                key={ad.id}
                className="flex items-center p-5 border rounded-md shadow-sm bg-gray-50 transition hover:shadow-md"
              >
                <Image
                  src={ad.imageUrl || 'https://via.placeholder.com/80'}
                  alt={ad.title}
                  width={80}
                  height={80}
                  className="object-cover rounded-md mr-5"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{ad.title}</h2>
                  <p className="text-gray-600 text-sm">
                    Created: {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      status === 'active'
                        ? 'text-green-600'
                        : status === 'pending'
                        ? 'text-yellow-600'
                        : status === 'expired'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(ad.id)}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, adId: ad.id })}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold text-center mb-4">Are you sure?</h2>
            <p className="text-center text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setDeleteModal({ show: false, adId: null })}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
