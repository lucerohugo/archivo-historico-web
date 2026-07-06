'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

/**
 * Componente para proteger rutas
 * Si no está logueado → redirige a /login
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setAuthorized(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  // Mostrar contenido solo si está logueado
  if (!authorized) {
    return null; // O puedes mostrar un spinner
  }

  return <>{children}</>;
}
