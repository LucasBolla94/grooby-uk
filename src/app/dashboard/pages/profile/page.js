'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { sendVerificationSMS } from '@/lib/firebaseAuthHelper';

export default function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  // phoneInput armazenará o número com o prefixo +44
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');

  // Carrega os dados do usuário autenticado (pode ser aprimorado usando Firestore)
  useEffect(() => {
    if (auth.currentUser) {
      setUserData({
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        phone: auth.currentUser.phoneNumber || ''
      });
      // Garante que o phoneInput tenha o prefixo +44 (caso não esteja vazio)
      const currentPhone = auth.currentUser.phoneNumber || '';
      setPhoneInput(currentPhone.startsWith('+44') ? currentPhone : '+44' + currentPhone);
    }
  }, []);

  const handleSendVerification = async () => {
    try {
      const result = await sendVerificationSMS(phoneInput);
      setConfirmationResult(result);
      setMessage('Verification code sent. Please check your phone.');
    } catch (error) {
      console.error(error);
      // Exemplo de tratamento de erro para número inválido
      if (error.message.includes('auth/invalid-phone-number')) {
        setMessage('Invalid phone number. Please check your input.');
      } else {
        setMessage('Error sending verification code: ' + error.message);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !verificationCode) return;
    try {
      await confirmationResult.confirm(verificationCode);
      setMessage('Phone verified successfully.');
      // Aqui, você pode chamar o endpoint API (/api/edit-user/route.js) para atualizar o telefone
    } catch (error) {
      setMessage('Error verifying code: ' + error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode enviar os dados atualizados do perfil para seu endpoint API.
    setMessage('Profile updated successfully.');
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <Image
            src="/images/default-profile.jpg"
            alt="Profile Picture"
            width={64}
            height={64}
            className="rounded-full"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Change Photo
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-gray-700 mb-1">Name:</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={userData.name}
            onChange={(e) =>
              setUserData({ ...userData, name: e.target.value })
            }
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />
        </div>

        {/* Phone com prefixo +44 */}
        <div>
          <label className="block text-gray-700 mb-1">Phone:</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-200 text-gray-600">
              +44
            </span>
            <input
              type="text"
              className="w-full border border-l-0 rounded-r px-3 py-2"
              // Remove o +44 do valor exibido para que o usuário digite somente os dígitos
              value={phoneInput.replace(/^\+44/, '')}
              onChange={(e) => {
                // Sempre adiciona +44 ao valor digitado
                setPhoneInput('+44' + e.target.value);
              }}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* SMS Verification Buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <button
            type="button"
            onClick={handleSendVerification}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2 sm:mb-0"
          >
            Send Verification Code
          </button>
          {confirmationResult && (
            <>
              <input
                type="text"
                placeholder="Verification Code"
                className="w-full sm:w-auto border rounded px-3 py-2 mb-2 sm:mb-0"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Verify Code
              </button>
            </>
          )}
        </div>

        {/* Message Feedback */}
        {message && <p className="text-sm text-gray-700">{message}</p>}

        {/* Save Changes */}
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Changes
        </button>
      </form>
      {/* Container para o reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
