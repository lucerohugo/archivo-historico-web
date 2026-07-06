'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

/**
 * Layout para rutas protegidas (/admin/*)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setAuthorized(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
