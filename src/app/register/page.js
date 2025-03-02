'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerWithEmail(email, password);
      if (user) {
        // Save user details in Firestore
        await setDoc(doc(collection(db, 'users-uk'), user.uid), {
          firstName,
          lastName,
          email,
          createdAt: new Date(),
        });
        alert('Account created successfully!');
        router.push('/');
      } else {
        alert('Failed to register. Try again.');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Error creating account.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg mt-10 rounded-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-mail"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full p-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {/* Link para a página de login */}
      <div className="mt-4 text-center">
        <p>
          You already have an account?{' '}
          <a
            href="/login"
            className="text-blue-500 hover:text-blue-700 font-semibold"
          >
            Log in here!
          </a>
        </p>
      </div>
    </div>
  );
}
