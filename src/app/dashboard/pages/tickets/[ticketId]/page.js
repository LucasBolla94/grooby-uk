"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { realtimeDB } from "@/lib/firebase";
import { ref, onValue, push, set } from "firebase/database";
import { FiSend } from "react-icons/fi";

export default function TicketPage() {
  const { ticketId } = useParams();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Gerencia o estado do usuário autenticado
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, [auth]);

  // Carrega a conversa do ticket em tempo real do Realtime DB
  useEffect(() => {
    if (!ticketId) return;
    const messagesRef = ref(realtimeDB, `tickets/${ticketId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const msgs = [];
      snapshot.forEach((childSnapshot) => {
        msgs.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      // Ordena as mensagens pela data de criação, se existir
      msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [ticketId]);

  // Faz o scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envia uma nova mensagem para a conversa do ticket
  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    if (!currentUser) return; // Apenas envia se o usuário estiver autenticado
    
    const messagesRef = ref(realtimeDB, `tickets/${ticketId}/messages`);
    const newMsgRef = push(messagesRef);
    const now = new Date();
    await set(newMsgRef, {
      uid: currentUser.uid,               // UID do usuário que enviou a mensagem
      msg: newMessage,                    // Conteúdo da mensagem
      createdAt: now.getTime(),           // Timestamp para ordenação
      date: now.toLocaleDateString("pt-BR"), // Data formatada (dia/mês/ano)
      time: now.toLocaleTimeString("pt-BR")  // Hora formatada (hora:minutos:segundos)
    });
    setNewMessage("");
  };

  const userId = currentUser ? currentUser.uid : null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Ticket Details</h1>
        <p className="text-sm text-gray-500">Ticket ID: {ticketId}</p>
      </header>

      {/* Área de Conversa */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.uid === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-lg shadow-sm max-w-md ${
                    msg.uid === userId
                      ? "bg-green-100 text-green-900 border border-green-200"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{msg.msg}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {msg.uid === userId ? "You" : msg.uid} - {msg.date} às {msg.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Nenhuma mensagem ainda.</p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Área de Input */}
      <footer className="bg-white p-4 border-t shadow flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg flex items-center"
        >
          Enviar <FiSend className="ml-2" />
        </button>
      </footer>
    </div>
  );
}
