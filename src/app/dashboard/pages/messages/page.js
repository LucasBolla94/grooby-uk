'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useRouter } from 'next/navigation';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Obter usuário logado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setError("User not logged in");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Escutar as mensagens no "chat-ads" e filtrar por sellerId igual ao uid do usuário logado
  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const chatAdsRef = ref(db, "chat-ads");

    const handleValue = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Converte o objeto em um array, filtra pelas mensagens cujo sellerId é igual ao uid do usuário e ordena pelo timestamp
        const msgs = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((msg) => msg.sellerId === user.uid)
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
      } else {
        setMessages([]);
      }
      setLoading(false);
    };

    onValue(chatAdsRef, handleValue, (err) => {
      setError(err.message);
      setLoading(false);
    });

    // Limpar o listener ao desmontar o componente
    return () => off(chatAdsRef, "value", handleValue);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-700">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho fixo */}
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        </div>
      </header>

      {/* Área de mensagens rolável */}
      <main className="container mx-auto flex-1 px-4 py-6 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-xl text-gray-700 text-center">
            No messages received.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => router.push(`/dashboard/chat/${msg.id}`)}
                className="cursor-pointer bg-white shadow rounded-lg p-4 flex flex-col md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-semibold">
                    {msg.senderName || "Unknown Sender"}
                  </p>
                  <p className="text-gray-700 mt-1">{msg.text}</p>
                </div>
                <div className="mt-2 md:mt-0 md:ml-4">
                  {msg.timestamp && (
                    <p className="text-sm text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
