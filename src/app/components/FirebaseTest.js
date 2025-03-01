'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';

export default function FirebaseTest() {
  useEffect(() => {
    console.log('🔥 Firebase Auth:', auth);
    console.log('👤 Usuário autenticado:', auth.currentUser);
  }, []);

  return <div>Verifique o console para ver os logs do Firebase.</div>;
}
