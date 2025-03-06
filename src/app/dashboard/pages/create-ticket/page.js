'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, realtimeDB } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { Button } from '@/app/components/ui/Button';

export default function CreateTicketPage() {
  const [category, setCategory] = useState('Ads Help');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You need to be logged in to create a ticket.');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
    const timeStr = `${now.getHours()}${now.getMinutes()}`;
    const ticketId = `${user.uid}_${dateStr}_${timeStr}`;
    const ticketRef = ref(realtimeDB, `tickets/${ticketId}`);

    // Formata a data e a hora para exibição
    const formattedDate = now.toLocaleDateString("pt-BR");
    const formattedTime = now.toLocaleTimeString("pt-BR");

    try {
      await set(ticketRef, {
        category,
        // Armazena a mensagem como objeto com as chaves 'uid', 'msg', 'date', 'time'
        message: {
          uid: user.uid,
          msg: message,
          date: formattedDate,
          time: formattedTime,
        },
        status: true,
        createdAt: now.getTime(),
        userId: user.uid,
      });
      alert('Ticket created successfully!');
      router.push('/dashboard/pages/help');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Support Ticket</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded-lg">
        <label className="block text-gray-700 font-medium">Category</label>
        <select
          className="w-full p-2 border rounded-lg mb-4"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Ads Help">Ads Help</option>
          <option value="Account Help">Account Help</option>
          <option value="Premium Ads">Premium Ads</option>
          <option value="Other">Other</option>
        </select>

        <label className="block text-gray-700 font-medium">Message</label>
        <textarea
          className="w-full p-2 border rounded-lg mb-4"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <Button type="submit" className="bg-black text-white w-full">
          Send
        </Button>
      </form>
    </div>
  );
}
