// src/lib/firebaseAuthHelper.js
import { auth } from './firebase'; // Certifique-se de que este caminho está correto para o seu arquivo de configuração do Firebase
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

/**
 * Configura e retorna um objeto RecaptchaVerifier.
 * @param {string} containerId - O id do container do reCAPTCHA.
 * @returns {RecaptchaVerifier}
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  return new RecaptchaVerifier(
    containerId,
    {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA resolvido - você pode continuar com signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Trate quando o reCAPTCHA expirar.
      },
    },
    auth
  );
}

/**
 * Envia o SMS de verificação para o número fornecido.
 * @param {string} phoneNumber - O número de telefone do usuário.
 * @param {string} containerId - (Opcional) O id do container do reCAPTCHA.
 * @returns {Promise<ConfirmationResult>}
 */
export async function sendVerificationSMS(phoneNumber, containerId = 'recaptcha-container') {
  const recaptchaVerifier = setupRecaptcha(containerId);
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    throw error;
  }
}
