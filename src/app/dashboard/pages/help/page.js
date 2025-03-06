"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, realtimeDB, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { onAuthStateChanged } from "firebase/auth";

export default function HelpPage() {
  const [chatStatus, setChatStatus] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  // Atualiza o estado do usuário autenticado
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Escuta atualizações em tempo real do status do agente (via Firestore)
  useEffect(() => {
    const agentRef = collection(db, 'AgentWork');
    const agentQuery = query(agentRef, where('status', '==', true));
    const unsubscribeAgent = onSnapshot(agentQuery, (snapshot) => {
      setChatStatus(!snapshot.empty);
    });
    return () => unsubscribeAgent();
  }, []);

  // Carrega os tickets do Realtime DB que pertencem ao usuário logado
  useEffect(() => {
    if (!currentUser) return;
    const ticketsRef = ref(realtimeDB, 'tickets');
    const unsubscribeTickets = onValue(ticketsRef, (snapshot) => {
      const ticketsArray = [];
      snapshot.forEach((childSnapshot) => {
        const ticketData = childSnapshot.val();
        if (ticketData.userId === currentUser.uid) {
          ticketsArray.push({ id: childSnapshot.key, ...ticketData });
        }
      });
      setTickets(ticketsArray);
    });
    return () => unsubscribeTickets();
  }, [currentUser]);

  const handleChatSupport = () => {
    if (!currentUser) {
      alert('You need to be logged in to start a chat.');
      return;
    }
    // Gera um chatId usando o UID e a data (dia, mês, ano)
    const today = new Date();
    const dateStr = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
    const chatId = `${currentUser.uid}_${dateStr}`;
    router.push(`/dashboard/pages/chat-support/${chatId}`);
  };

  const handleCreateTicket = () => {
    router.push(`/dashboard/pages/create-ticket`);
  };

  const handleTicketClick = (ticketId) => {
    // Redireciona para a página do ticket correta: /dashboard/tickets/[ticketId]
    router.push(`/dashboard/pages/tickets/${ticketId}`);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white shadow p-4 rounded-lg">
        <div>
          <h2 className="text-xl font-semibold">Support</h2>
          <p className="text-gray-600">Need help? Contact us.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2">
          {chatStatus ? (
            <Button className="bg-green-500 text-white" onClick={handleChatSupport}>
              Chat Online
            </Button>
          ) : (
            <div className="text-gray-600 text-center">
              <p>Chat - Offline</p>
              <p className="text-sm">Monday - Friday 10:00AM - 20:00PM</p>
            </div>
          )}
          <Button className="bg-black text-white" onClick={handleCreateTicket}>
            Create Ticket
          </Button>
          <Button
            className="bg-green-600 text-white"
            onClick={() =>
              window.open(
                'https://wa.me/+447415162171?text=Hello! I need support.',
                '_blank'
              )
            }
          >
            WhatsApp
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Open Tickets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.length > 0 ? (
            tickets.map(ticket => (
              <Card
                key={ticket.id}
                className="border p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTicketClick(ticket.id)}
              >
                <CardContent>
                  <p className="font-medium">
                    Category: <span className="text-gray-700">{ticket.category || "N/A"}</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Opened At: {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Status: {ticket.status === true ? "Open" : "Closed"}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-600">No open tickets found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
