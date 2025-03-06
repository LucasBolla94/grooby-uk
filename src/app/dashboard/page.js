"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Logo from '../components/logo';

export default function DashboardHome() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  // Detecta o usuário logado e guarda os dados dele no estado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Busca os dados do dashboard da API somente quando o usuário estiver definido
  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return;
      setLoading(true);
      try {
        // Inclui o uId na URL
        const response = await fetch(`/api/dashboard?uId=${currentUser.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [currentUser]);

  // Se estiver carregando, mostra uma mensagem de loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  // Se ocorrer algum erro, exibe a mensagem de erro
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Renderiza a página do dashboard com as informações e o uid do usuário logado
  return (
    <div className="p-4">
      <header className="mb-6">
        {currentUser &&(
          <h1 className="text-2xl font-bold mt-4">
            Welcome your Dashboard {currentUser.firstName}
          </h1>
        )}
        
        <p className="text-gray-600 mt-2">Select an option from the menu.</p>
        {currentUser && (
          <p className="text-gray-500 mt-1 text-sm">
            Your email registred: {currentUser.email}
          </p>
        )}
      </header>

      {/* Resumo com informações do usuário */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold text-gray-800">Active Listings</h3>
          <p className="text-2xl text-blue-600">{summary.activeListings}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold text-gray-800">Pending Listings</h3>
          <p className="text-2xl text-blue-600">{summary.pendingListings}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold text-gray-800">Expired Listings</h3>
          <p className="text-2xl text-blue-600">{summary.expiredListings}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold text-gray-800">Total Views</h3>
          <p className="text-2xl text-blue-600">{summary.totalViews}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-bold text-gray-800">Contacts Received</h3>
          <p className="text-2xl text-blue-600">{summary.viewsDetails}</p>
        </div>
      </div>
    </div>
  );
}
