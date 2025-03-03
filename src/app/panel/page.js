'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from './components/home';
import Ads from './components/ads';
import Seller from './components/seller';
import Help from './components/help';
import Settings from './components/settings';
import Chat from './components/chat'; 
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi'; 

const Panel = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeContent, setActiveContent] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.error("⚠ Firebase auth is not initialized.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-lg font-semibold text-gray-700">Loading...</div>;
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const renderContent = () => {
    if (activeContent) {
      return activeContent;
    }

    switch (activeTab) {
      case 'Home': return <Home />;
      case 'Ads': return <Ads />;
      case 'Seller': return <Seller setActiveTab={setActiveTab} />;
      case 'Help': return <Help setActiveContent={setActiveContent} />;
      case 'Settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botão para abrir a sidebar no mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded-lg md:hidden shadow-md"
      >
        {isSidebarOpen ? <FiX size={26} /> : <FiMenu size={26} />}
      </button>

      {/* Sidebar responsiva */}
      <div className={`fixed md:relative top-0 left-0 h-full bg-gray-900 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-all duration-300 ease-in-out w-64 md:w-1/5 shadow-lg flex flex-col`}>
        <h2 className="text-2xl font-bold text-center py-6">User Panel</h2>

        <div className="flex flex-col space-y-2 px-4">
          {["Home", "Ads", "Seller", "Help", "Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition ${activeTab === tab ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Botão de logout */}
        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
          >
            <FiLogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Panel;
