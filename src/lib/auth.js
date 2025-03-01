// src/lib/auth.js
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from './firebase';  // Importando a instância do app Firebase

// Obtenha a instância de auth a partir do app
const auth = getAuth(app);

// Função para login com email e senha
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;  // Retorna o usuário autenticado
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;  // Retorna null em caso de erro
  }
};

// Exporta a instância auth para outros arquivos utilizarem
export { auth };
