"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import Logo from "@/app/components/logo";
import Footer from "@/app/components/footer";

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Inicializa o Realtime Database
  const db = getDatabase();
  // Cria uma referência para o chat em "chat-ads/{chatId}"
  const chatRef = ref(db, `chat-ads/${chatId}`);

  useEffect(() => {
    // Inscreve-se para escutar alterações no chat
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

  useEffect(() => {
    // Scroll para o fim das mensagens a cada atualização
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const auth = getAuth();
    const user = auth.currentUser;
    // Usa o uid do usuário ou "anonymous" caso não esteja logado (mas, nesse fluxo, o redirecionamento já ocorreu)
    const sender = user ? user.uid : "anonymous";
    const timestamp = Date.now();

    // Envia a mensagem para o Realtime Database
    await push(chatRef, { sender, message: newMessage, timestamp });
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Logo />
      <div className="flex-grow container mx-auto p-4 flex flex-col">
        {/* Header do Chat */}
        <h1 className="text-2xl font-bold mb-4 text-center">Chat</h1>
        {/* Área de mensagens */}
        <div className="flex-grow bg-gray-100 rounded-lg p-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {messages.map((msg) => {
            const isCurrentUser = msg.sender === getAuth().currentUser?.uid;
            return (
              <div
                key={msg.id}
                className={`mb-2 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
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
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Campo de entrada e botão para enviar mensagem */}
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
      </div>
      <Footer />
    </div>
  );
}
