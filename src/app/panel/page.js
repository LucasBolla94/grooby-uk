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
import Chat from './components/chat'; // Importando o componente Chat
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi'; // Ícones para menu responsivo e logout

const Panel = () => {
  // Estado para gerenciar a aba ativa do painel
  const [activeTab, setActiveTab] = useState('Home');
  // Estado para armazenar os dados do usuário autenticado
  const [user, setUser] = useState(null);
  // Estado para indicar se os dados ainda estão carregando
  const [isLoading, setIsLoading] = useState(true);
  // Estado para controlar a visibilidade da sidebar em telas menores
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Estado para controlar o conteúdo dinâmico exibido (ex: chat ao vivo)
  const [activeContent, setActiveContent] = useState(null);

  const router = useRouter();

  // useEffect para monitorar a autenticação do usuário
  useEffect(() => {
    // Verifica se o Firebase auth foi inicializado corretamente
    if (!auth) {
      console.error("⚠ Firebase auth is not initialized.");
      setIsLoading(false);
      return;
    }

    // onAuthStateChanged monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Limpa o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Redireciona para a página de login se o usuário não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Enquanto os dados carregam, exibe uma mensagem de loading
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-lg">Loading...</div>;
  }

  // Evita renderizar o conteúdo caso o usuário não esteja autenticado (já redirecionado)
  if (!user) return null;

  // Função para realizar o logout do usuário
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
    }
  };

  // Função que renderiza o conteúdo baseado na aba ativa selecionada
  const renderContent = () => {
    if (activeContent) {
      return activeContent;  // Renderiza conteúdo dinâmico como o chat ao vivo
    }

    switch (activeTab) {
      case 'Home':
        return <Home />;
      case 'Ads':
        return <Ads />;
      case 'Seller':
        return <Seller setActiveTab={setActiveTab} />;
      case 'Help':
        return <Help setActiveContent={setActiveContent} />;  // Passando a função setActiveContent como prop
      case 'Settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Botão para abrir/fechar a sidebar em telas pequenas */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md md:hidden"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar responsiva com navegação */}
      <div className={`fixed md:relative top-0 left-0 h-full bg-gray-900 text-white p-5 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out w-64 md:w-1/5`}>
        <h2 className="text-xl font-bold mb-6 text-center">User Panel</h2>
        
        <div className="space-y-3">
          <button onClick={() => setActiveTab('Home')} className={`block w-full p-3 rounded-md hover:bg-gray-800 transition ${activeTab === 'Home' ? 'bg-gray-700' : 'bg-gray-800'}`}>Home</button>
          <button onClick={() => setActiveTab('Ads')} className={`block w-full p-3 rounded-md hover:bg-gray-800 transition ${activeTab === 'Ads' ? 'bg-gray-700' : 'bg-gray-800'}`}>Ads</button>
          <button onClick={() => setActiveTab('Seller')} className={`block w-full p-3 rounded-md hover:bg-gray-800 transition ${activeTab === 'Seller' ? 'bg-gray-700' : 'bg-gray-800'}`}>Seller</button>
          <button onClick={() => setActiveTab('Help')} className={`block w-full p-3 rounded-md hover:bg-gray-800 transition ${activeTab === 'Help' ? 'bg-gray-700' : 'bg-gray-800'}`}>Help</button>
          <button onClick={() => setActiveTab('Settings')} className={`block w-full p-3 rounded-md hover:bg-gray-800 transition ${activeTab === 'Settings' ? 'bg-gray-700' : 'bg-gray-800'}`}>Settings</button>
        </div>

        {/* Botão de logout posicionado na parte inferior da sidebar */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-3 w-5/6 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Área principal de conteúdo, que se adapta ao tamanho da tela */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Panel;
