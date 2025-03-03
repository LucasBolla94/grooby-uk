'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import Logo from '../components/logo'; // Importando a barra de navegação

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setMessage({ type: 'error', text: '⚠️ Please fill in all fields.' });
      return;
    }

    setLoading(true);
    try {
      const user = await registerWithEmail(email, password);
      if (user) {
        await setDoc(doc(collection(db, 'users-uk'), user.uid), {
          firstName,
          lastName,
          email,
          createdAt: new Date(),
        });
        setMessage({ type: 'success', text: '✅ Account created successfully! Redirecting...' });
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: '❌ Failed to register. Try again.' });
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setMessage({ type: 'error', text: '❌ Error creating account.' });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Barra de navegação fixa no topo */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Logo />
      </nav>

      {/* Conteúdo centralizado */}
      <div className="flex flex-col justify-center items-center flex-grow px-4 pt-20">
        {/* Título Grooby */}
        <h1 className="text-4xl font-extrabold text-black mb-6">Grooby</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Create Your Account</h2>

          {/* Mensagem de erro/sucesso */}
          {message && (
            <p
              className={`text-sm text-center p-3 rounded-md transition-all font-medium ${
                message.type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}
            >
              {message.text}
            </p>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Campo de Nome */}
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition shadow-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition shadow-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {/* Campo de Email */}
            <div>
              <input
                type="email"
                placeholder="E-mail"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo de Senha */}
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Botão de Registro */}
            <button
              type="submit"
              className={`w-full p-3 text-white rounded-lg font-semibold transition-all shadow-md ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-900'
              }`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          {/* Link para a página de login */}
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition">
                Log in here!
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
