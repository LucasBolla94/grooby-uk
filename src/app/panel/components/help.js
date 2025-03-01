'use client';

import { useState } from 'react';
import Chat from './chat'; // Importa o componente Chat

export default function Help({ setActiveContent }) {
  const [ticketDetails, setTicketDetails] = useState('');
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);

  const openLiveChat = () => {
    // Abre o componente de chat ao vivo
    setActiveContent(<Chat />);  // Carrega o componente Chat
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    console.log('Ticket Submitted:', ticketDetails);
    setIsTicketSubmitted(true);
    setTicketDetails('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg mt-10 rounded-xl">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Ajuda ao Cliente</h1>
      <div className="flex justify-center space-x-6 mb-8">
        {/* Botão para abrir o chat ao vivo */}
        <button
          onClick={openLiveChat}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Chat ao Vivo
        </button>

        {/* Botão para abrir o ticket */}
        <button
          onClick={() =>
            setActiveContent(
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Abrir Ticket</h2>
                <form onSubmit={submitTicket}>
                  <textarea
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    className="w-full p-4 border rounded-md"
                    rows="4"
                    placeholder="Descreva seu problema..."
                  />
                  <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Submeter Ticket
                  </button>
                </form>
              </div>
            )
          }
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Abrir Ticket
        </button>
      </div>

      {/* Exibe uma mensagem de sucesso se o ticket for enviado */}
      {isTicketSubmitted && <p className="text-green-600 text-center">Ticket enviado com sucesso!</p>}
    </div>
  );
}
