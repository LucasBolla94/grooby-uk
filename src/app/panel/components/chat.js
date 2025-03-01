'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, realtimeDB, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { set, ref, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const ChatCategory = () => {
  const [categories, setCategories] = useState([]); // Armazena categorias do Firestore
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // 🔹 Obtém usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Busca categorias do Firestore na coleção 'chat-category-suporte-uk'
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'chat-category-suporte-uk'));
        const categoryList = querySnapshot.docs.map(doc => doc.data().name); // Obtém apenas os nomes
        setCategories(categoryList);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Quando o usuário seleciona uma categoria
  const handleCategorySelect = async (category) => {
    if (!user) {
      alert("Você precisa estar logado para abrir um ticket.");
      return;
    }

    setLoading(true);
    try {
      // Criando um novo ticket na fila da categoria escolhida
      const queueRef = ref(realtimeDB, `queues/${category}`);
      const newQueueEntry = push(queueRef);

      // Registrando os dados na fila
      await set(newQueueEntry, {
        userId: user.uid, // ID do usuário autenticado
        queue: true,
        timestamp: Date.now(),
      });

      // Redireciona para a sala do chat usando o ID gerado
      router.push(`/help/chat/${newQueueEntry.key}`);
    } catch (error) {
      console.error("Erro ao adicionar usuário à fila:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Selecione a categoria de suporte</h1>

      {/* 🔹 Mostra um aviso se não houver categorias */}
      {categories.length === 0 && <p>Carregando categorias...</p>}

      {/* 🔹 Botões para selecionar a categoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategorySelect(category)}
            className="bg-black text-white p-4 rounded-lg hover:bg-gray-800 transition"
            disabled={loading}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p className="mt-4">Carregando...</p>}
    </div>
  );
};

export default ChatCategory;
