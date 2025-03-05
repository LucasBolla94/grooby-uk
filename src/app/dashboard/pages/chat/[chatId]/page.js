'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function Chat() {
  const { chatId } = useParams();
  const [user, setUser] = useState(null);
  const [chatDetails, setChatDetails] = useState(null);
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

  // Obter os detalhes do chat (thumbnail, address, postcode)
  useEffect(() => {
    if (!chatId) return;
    const db = getDatabase();
    const detailsRef = ref(db, `chats/${chatId}/details`);
    const unsubscribeDetails = onValue(
      detailsRef,
      (snapshot) => {
        const data = snapshot.val();
        setChatDetails(data);
      },
      (err) => {
        setError(err.message);
      }
    );
    return () => unsubscribeDetails();
  }, [chatId]);

  // Escutar as mensagens do chat na Realtime Database
  useEffect(() => {
    if (!chatId) return;
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribeMessages = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const msgs = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          msgs.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgs);
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
  }, [chatId]);

  // Buscar e armazenar firstName para cada senderId dos messages
  useEffect(() => {
    const dbFirestore = getFirestore();
    const senderIds = Array.from(new Set(messages.map((msg) => msg.senderId)));
    senderIds.forEach(async (uid) => {
      // Se já tivermos o firstName em cache, pula a busca
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

  // Função para rolar até a última mensagem (apenas na área de chat)
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
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const messageData = {
      text: newMessage.trim(),
      senderId: user.uid,
      // Note: agora não armazenamos firstName diretamente; ele será buscado do Firestore
      timestamp: Date.now(),
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
      {/* Header com chat details */}
      <header className="flex items-center bg-white shadow py-4 px-6">
        {chatDetails ? (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src={chatDetails.image && chatDetails.image[0] ? chatDetails.image[0] : '/placeholder.jpg'}
                alt="Chat Thumbnail"
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-black">
                {chatDetails.address || 'Address not provided'}
              </p>
              <p className="text-sm text-black">
                {chatDetails.postcode || 'Postcode not provided'}
              </p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-black">Chat</h1>
        )}
      </header>

      {/* Área de mensagens com scroll apenas nesta seção */}
      <main className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <p className="text-center text-black">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-black">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            // Usar o firstName obtido do Firestore; se não existir, fallback para 'Unknown'
            const senderName = userNames[msg.senderId] || 'Unknown';
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

      {/* Formulário de envio de mensagem (fixado na parte inferior) */}
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
