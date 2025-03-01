'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Use useParams para acessar o parâmetro da URL
import { db, realtimeDB, auth } from '@/lib/firebase';
import { ref, get, push, set, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const ChatPage = () => {
  const { queueId } = useParams(); // Acessa o parâmetro dinâmico da URL (queueId)
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const [startTime, setStartTime] = useState(null);

  // 🔹 Obtém o usuário autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; // Verifica se o usuário está autenticado

    // 🔹 Consultar todas as filas de atendimento (categories) em 'queues'
    const queuesRef = ref(realtimeDB, 'queues');
    
    get(queuesRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const allQueues = snapshot.val();
          let found = false;

          // 🔹 Procura em todas as filas e verifica se o usuário está na fila
          for (const category in allQueues) {
            const queue = allQueues[category];
            for (const queueId in queue) {
              const entry = queue[queueId];
              
              if (entry.userId === user.uid && entry.queue) {
                setChatData(entry);
                setStartTime(new Date(entry.timestamp)); // Armazena o tempo de início do chat
                found = true;
                
                // 🔹 Verifica se há mensagens no chat
                const messagesRef = ref(realtimeDB, `chats/${queueId}/messages`);
                get(messagesRef)
                  .then((snapshot) => {
                    if (snapshot.exists()) {
                      const allMessages = snapshot.val();
                      setMessages(Object.values(allMessages));

                      // 🔹 Se não houver mensagens, envia a mensagem do sistema
                      if (Object.keys(allMessages).length === 0) {
                        const newMessage = push(messagesRef);
                        set(newMessage, {
                          userId: 'system',  // Mensagem do sistema
                          message: 'You are in the queue, please give a minute',
                          timestamp: Date.now(),
                        });
                      }
                    }
                  })
                  .catch((error) => {
                    console.error('Erro ao obter mensagens:', error);
                  });

                router.push(`/help/chat/${queueId}`);
                break;
              }
            }
            if (found) break;
          }

          if (!found) {
            console.log('Usuário não encontrado na fila.');
          }
        } else {
          console.log('Não foi possível encontrar as filas.');
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar filas no banco:', error);
      })
      .finally(() => setLoading(false));
  }, [user]); // Dependência para reexecutar quando 'user' mudar

  useEffect(() => {
    if (!chatData) return;

    // 🔹 Monitorar as mensagens em tempo real
    const messagesRef = ref(realtimeDB, `chats/${queueId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        setMessages(Object.values(allMessages));
      }
    });

    // 🔹 Limpeza do evento ao sair da página
    return () => unsubscribe();
  }, [chatData, queueId]); // Recarregar mensagens sempre que o chatData ou queueId mudarem

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // 🔹 Envia a nova mensagem para o banco de dados
    const messagesRef = ref(realtimeDB, `chats/${queueId}/messages`);
    const newMessage = push(messagesRef);

    set(newMessage, {
      userId: user.uid,
      message,
      timestamp: Date.now(),
    })
      .then(() => {
        setMessage(''); // Limpa o campo de input
      })
      .catch((error) => {
        console.error('Erro ao enviar mensagem:', error);
      });
  };

  const getTimeElapsed = () => {
    if (!startTime) return '0s';
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000); // Em segundos
    return `${elapsed}s`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!chatData) {
    return <div className="text-center">Chat não encontrado ou o usuário não está na fila.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg space-y-6">
      {/* Título do chat com a categoria */}
      <h1 className="text-2xl font-semibold text-center text-gray-700">Chat {chatData.category}</h1>
      
      {/* Tempo de espera */}
      <div className="absolute top-2 left-2 text-sm text-gray-500">
        Tempo de espera: {getTimeElapsed()}
      </div>

      {/* Exibir as mensagens do chat */}
      <div className="overflow-y-auto h-80 bg-gray-100 p-4 rounded-lg space-y-4">
        <h2 className="text-xl font-medium text-gray-700">Mensagens:</h2>
        <div className="space-y-2">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-lg ${msg.userId === 'system' ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white'}`}>
                <strong>{msg.userId === 'system' ? 'Sistema' : msg.userId}:</strong> {msg.message}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Sem mensagens ainda.</p>
          )}
        </div>
      </div>

      {/* Campo de entrada de mensagem */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatData?.agent} // Desabilita o botão se agent não for true
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none disabled:bg-gray-300"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
