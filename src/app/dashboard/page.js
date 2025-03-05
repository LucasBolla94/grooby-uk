'use client';

import { useState, useEffect } from 'react';
import Logo from '../components/logo';

export default function DashboardHome() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar os dados do dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard');
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
  }, []);

  // Exibe mensagem de loading ou erro, se houver
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Supondo que 'summary' possua a estrutura:
  // { activeListings, pendingListings, expiredListings, totalViews, contactsReceived }
  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mt-4">Welcome to your Dashboard</h1>
        <p className="text-gray-600 mt-2">Select an option from the menu.</p>
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
          <p className="text-2xl text-blue-600">{summary.contactsReceived}</p>
        </div>
      </div>
    </div>
  );
}
