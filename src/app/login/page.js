'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail } from '../../lib/auth';
import Logo from '../components/logo'; // Importando a barra de navegação

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const user = await loginWithEmail(email, password);
      if (user) {
        setMessage({ type: 'success', text: '✅ Login successful! Redirecting...' });
        setTimeout(() => {
          router.push('/dashboard'); // Redireciona para o painel após 1,5s
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ ' + error.message });
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Barra de navegação fixa no topo */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <Logo />
      </nav>

      {/* Conteúdo Centralizado */}
      <div className="flex flex-col justify-center items-center flex-grow px-4 pt-20">
        {/* Título Grooby */}
        <h1 className="text-4xl font-extrabold text-black mb-6">Grooby</h1>

        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Welcome Back!</h2>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
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

            {/* Botão de Login */}
            <button
              type="submit"
              className={`w-full p-3 text-white rounded-lg font-semibold transition-all shadow-md ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-900'
              }`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
