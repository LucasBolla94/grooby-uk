"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Logo from "@/app/components/logo";
import Footer from "@/app/components/footer";

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  
  // Extraindo o adsId do chatId (formato: senderId_adOwnerId_adsId)
  const parts = chatId.split("_");
  const adsId = parts[2];

  const [ad, setAd] = useState(null);
  const [adLoading, setAdLoading] = useState(true);

  // Estado do chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Inicializa o Realtime Database e cria a referência do chat
  const dbRT = getDatabase();
  const chatRef = ref(dbRT, `chat-ads/${chatId}`);

  // Obtém os dados do anúncio (para exibir o endereço e o createdBy)
  useEffect(() => {
    if (!adsId) return;
    const fetchAd = async () => {
      try {
        const adRef = doc(db, "ads-uk", adsId);
        const adSnap = await getDoc(adRef);
        if (adSnap.exists()) {
          setAd(adSnap.data());
        }
      } catch (err) {
        console.error("Erro ao buscar anúncio:", err);
      } finally {
        setAdLoading(false);
      }
    };
    fetchAd();
  }, [adsId]);

  // Inscreve-se para escutar alterações no chat
  useEffect(() => {
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      const msgs = data
        ? Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }))
        : [];
      // Ordena as mensagens pelo timestamp
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatRef]);

  // Scroll para o fim das mensagens a cada atualização
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // Impede que o usuário envie mensagem se ele for o dono do anúncio
    if (ad && user.uid === ad.createdBy) {
      alert("Você não pode criar um bate-papo consigo mesmo.");
      return;
    }

    const sender = user.uid;
    const now = new Date();
    const timestamp = now.getTime();
    const formattedDate = now.toLocaleString(); // Data e hora formatadas

    // Envia a mensagem para o Realtime Database, salvando também a data formatada
    await push(chatRef, { sender, message: newMessage, timestamp, date: formattedDate });
    setNewMessage("");
  };

  // Obter o usuário atual para comparação (impedir chat consigo mesmo)
  const currentUser = getAuth().currentUser;
  const isSelfChat = ad && currentUser && currentUser.uid === ad.createdBy;

  return (
    <div className="min-h-screen flex flex-col">
      <Logo />
      <div className="flex-grow container mx-auto p-4 flex flex-col">
        {/* Cabeçalho do Chat: mostra o endereço do anúncio se disponível */}
        <h1 className="text-2xl font-bold mb-4 text-center">
          {ad ? ad.address : "Chat"}
        </h1>
        {isSelfChat && (
          <div className="mb-4 text-center text-red-600 font-semibold">
            Você não pode conversar consigo mesmo.
          </div>
        )}
        {/* Área de mensagens */}
        <div
          className="flex-grow bg-gray-100 rounded-lg p-4 overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          {messages.map((msg) => {
            const isCurrentUser = msg.sender === currentUser?.uid;
            return (
              <div
                key={msg.id}
                className={`mb-2 flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-words ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 shadow"
                  }`}
                >
                  {msg.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.date}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Campo de entrada e botão para enviar mensagem */}
        {!isSelfChat && (
          <form onSubmit={handleSendMessage} className="mt-4 flex">
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
