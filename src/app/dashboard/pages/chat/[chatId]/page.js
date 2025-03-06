'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function Chat() {
  const { adsId } = useParams(); // Parâmetro da URL para filtrar mensagens
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({}); // Cache para armazenar firstName por senderId
  const messagesEndRef = useRef(null);

  // Obter o usuário logado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setError('User not logged in');
        setLoadingMessages(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Escutar as mensagens no "chat-ads" e filtrar por adsId
  useEffect(() => {
    if (!adsId) return;
    const db = getDatabase();
    const messagesRef = ref(db, 'chat-ads');
    const unsubscribeMessages = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Converte o objeto em array e filtra pelas mensagens cujo adsId seja igual ao parâmetro
          const msgs = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          const filtered = msgs.filter((msg) => msg.adsId === adsId);
          filtered.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(filtered);
        } else {
          setMessages([]);
        }
        setLoadingMessages(false);
        scrollToBottom();
      },
      (err) => {
        setError(err.message);
        setLoadingMessages(false);
      }
    );
    return () => unsubscribeMessages();
  }, [adsId]);

  // Buscar e armazenar o firstName para cada senderId (usando sellerId, conforme modelo)
  useEffect(() => {
    const dbFirestore = getFirestore();
    // Para cada mensagem, vamos buscar o nome associado ao sellerId
    const senderIds = Array.from(new Set(messages.map((msg) => msg.sellerId)));
    senderIds.forEach(async (uid) => {
      if (userNames[uid]) return;
      try {
        const userDoc = await getDoc(doc(dbFirestore, 'users-uk', uid));
        if (userDoc.exists()) {
          const firstName = userDoc.data().firstName;
          setUserNames((prev) => ({ ...prev, [uid]: firstName }));
        }
      } catch (err) {
        console.error('Error fetching user firstName for uid:', uid, err);
      }
    });
  }, [messages, userNames]);

  // Função para rolar até a última mensagem
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Função para enviar uma nova mensagem
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const db = getDatabase();
    const messagesRef = ref(db, 'chat-ads');
    const messageData = {
      text: newMessage.trim(),
      senderId: user.uid,
      timestamp: Date.now(),
      adsId, // Inclui o adsId para identificar a conversa
    };
    try {
      await push(messagesRef, messageData);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center bg-white shadow py-4 px-6">
        <h1 className="text-xl font-bold text-black">Chat for Ad {adsId}</h1>
      </header>

      {/* Área de mensagens */}
      <main className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <p className="text-center text-black">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-black">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const senderName = userNames[msg.sellerId] || 'Unknown';
            return (
              <div
                key={msg.id}
                className={`mb-4 p-3 rounded-lg max-w-md break-words ${
                  msg.senderId === user?.uid
                    ? 'bg-blue-100 text-black self-end'
                    : 'bg-gray-100 text-black self-start shadow'
                }`}
              >
                <div className="text-xs mb-1">
                  <strong>{senderName}</strong>
                </div>
                <div>{msg.text}</div>
                {msg.timestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Formulário de envio */}
      <form
        onSubmit={handleSend}
        className="flex items-center p-4 bg-white border-t"
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          type="submit"
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
