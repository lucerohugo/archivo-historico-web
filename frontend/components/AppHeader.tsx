'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  showAdminNav?: boolean;
  breadcrumb?: Crumb[];
}

export default function AppHeader({ showAdminNav, breadcrumb }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="border-b border-slate-100 px-10 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="logo-area">
          <Link href="/" className="logo-area no-underline">
            <Image
              src="/escudo-episcopal-212x300.png"
              alt="Escudo Episcopal Diocesano"
              width={28}
              height={40}
              className="object-contain"
            />
            <div className="logo-text">
              Archivo Histórico
              <small>Diocesano</small>
            </div>
          </Link>

          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-slate-400" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="text-xs text-sky-700 no-underline hover:text-sky-800">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side nav */}
        {showAdminNav && (
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {/* <Link
                href="/registrar"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Inicio
              </Link>
              <Link
                href="/admin/registros"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Todos los registros
              </Link> */}
              <Link
                href="/registrar/crear"
                className="rounded-md bg-sky-800 px-4 py-1.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-sky-700"
              >
                + Nuevo registro
              </Link>
            </nav>
            <div className="h-5 w-px bg-slate-200" />
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 no-underline transition-colors hover:bg-slate-50"
            >
              <LogOut size={12} />
              Salir
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
