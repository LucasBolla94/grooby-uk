// /src/lib/firebaseAuthHelper.js
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export function setupRecaptcha(containerId = 'recaptcha-container') {
  return new RecaptchaVerifier(
    containerId,
    {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA resolved - allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Handle expiration if needed.
      },
    },
    auth
  );
}

export async function sendVerificationSMS(phoneNumber, containerId = 'recaptcha-container') {
  const recaptchaVerifier = setupRecaptcha(containerId);
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    throw error;
  }
}
