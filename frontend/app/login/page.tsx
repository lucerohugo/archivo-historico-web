'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '@/lib/api';
import { setSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario || !password) {
      setError('Usuario y contraseña son requeridos.');
      return;
    }

    setLoading(true);

    const { data, error: loginError } = await login(usuario, password);

    if (loginError || !data) {
      setError(loginError || 'Usuario o contraseña inválidos.');
      setLoading(false);
      return;
    }

    setSession(data.usuario, data.access, data.refresh);
    router.push('/registrar');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      {/* Back */}
      <div className="absolute left-6 top-6">
        <Link href="/" className="btn-primary">Inicio</Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Top section */}
        <div className="px-8 pt-10 pb-7 text-center">
          <Image
            src="/escudo-episcopal-212x300.png"
            alt="Escudo Episcopal Diocesano"
            width={64}
            height={90}
            className="mx-auto mb-5 object-contain"
            priority
          />
          <h1 className="text-xl font-semibold text-slate-900">Área Administrativa</h1>
          <p className="mt-1 text-xs text-slate-500">Archivo Histórico Diocesano</p>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-8 py-7">
          <div className="form-field">
            <label className="form-label">Usuario</label>
            <input
              className="form-input"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Contraseña</label>
            <div className="relative">
              <input
                className="form-input pr-10"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary mt-1 w-full justify-center py-3"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>
        </form>

        <div className="h-px bg-slate-100" />

        <div className="px-8 py-5 text-center">
          <Link href="/registros" className="text-xs text-sky-700 no-underline hover:text-sky-800">
            Ver registros sin iniciar sesión
          </Link>
        </div>
      </div>

      <p className="mt-6 text-[11px] text-slate-400">
        Acceso restringido a personal autorizado
      </p>
    </div>
  );
}
