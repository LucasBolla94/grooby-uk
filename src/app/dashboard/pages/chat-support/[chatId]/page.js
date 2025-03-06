"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiSend } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { realtimeDB } from "@/lib/firebase";
import { ref, onValue, set, push, get } from "firebase/database";

export default function ChatSupportPage() {
  const { chatId } = useParams(); // URL parameter
  const router = useRouter();
  const auth = getAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(chatId || null);
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // 1. Detect the logged-in user and store user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // 2. Once the user is identified, check for an existing chat with status=true or create a new one.
  //    When creating a new chat, add an initial system message in English.
  useEffect(() => {
    if (!currentUser) return;
    const generateChatId = () => {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yy = String(today.getFullYear()).slice(-2);
      return currentUser.uid + dd + mm + yy;
    };

    const defaultChatId = generateChatId();
    const chatRef = ref(realtimeDB, `chat-support/${defaultChatId}`);

    const checkAndCreateChat = async () => {
      const snapshot = await get(chatRef);
      if (snapshot.exists() && snapshot.val().status === true) {
        const chat = snapshot.val();
        setChatData(chat);
        if (currentChatId !== defaultChatId) {
          setCurrentChatId(defaultChatId);
          router.replace(`/dashboard/pages/chat-support/${defaultChatId}`);
        }
      } else {
        // Create a new chat
        const initialMessage = {
          sender: "system",
          text: "Welcome to our support chat! An agent will join you shortly. Thank you for contacting us.",
          createdAt: Date.now(),
        };
        const chatObject = {
          status: true,
          userId: currentUser.uid,
          createdAt: Date.now(),
          // Note: agentId is not set initially
          messages: {},
        };
        await set(chatRef, chatObject);
        // Add initial system message
        const messagesRef = ref(realtimeDB, `chat-support/${defaultChatId}/messages`);
        const newMsgRef = push(messagesRef);
        await set(newMsgRef, initialMessage);

        const updatedChatObject = {
          ...chatObject,
          messages: { [newMsgRef.key]: initialMessage },
        };
        setChatData(updatedChatObject);
        if (currentChatId !== defaultChatId) {
          setCurrentChatId(defaultChatId);
          router.replace(`/dashboard/pages/chat-support/${defaultChatId}`);
        }
      }
    };

    checkAndCreateChat();
  }, [currentUser, currentChatId, router]);

  // 3. Load chat messages in real time from the "messages" node within the chat
  useEffect(() => {
    if (!currentChatId) return;
    const messagesRef = ref(realtimeDB, `chat-support/${currentChatId}/messages`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const msgs = [];
      snapshot.forEach((childSnapshot) => {
        msgs.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      // Sort messages by createdAt
      msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(msgs);
    });

    return () => {
      unsubscribeMessages();
    };
  }, [currentChatId]);

  // 4. Function to send a message: Only sends if chatData has agentId (i.e. an agent has joined)
  const sendMessage = async () => {
    if (newMessage.trim() === "" || !currentChatId) return;
    if (!chatData?.agentId) return; // Disable sending if no agent is assigned
    const messagesRef = ref(realtimeDB, `chat-support/${currentChatId}/messages`);
    const newMsgRef = push(messagesRef);
    await set(newMsgRef, {
      sender: "user",
      text: newMessage,
      createdAt: Date.now(),
    });
    setNewMessage("");
  };

  // 5. Scroll to the last message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Chat Support</h1>
          {currentChatId && (
            <p className="text-sm text-gray-500">Chat ID: {currentChatId}</p>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : msg.sender === "system"
                      ? "bg-green-300 text-gray-800 rounded-bl-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input and Send Button */}
      <footer className="bg-white p-4 shadow flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={!chatData?.agentId}
          className={`px-4 py-2 rounded-r-lg flex items-center ${
            chatData?.agentId
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          Send <FiSend className="ml-2" />
        </button>
      </footer>
    </div>
  );
}
