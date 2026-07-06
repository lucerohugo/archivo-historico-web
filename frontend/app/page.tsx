import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Search, Shield, Archive } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 px-10 py-5 flex items-center justify-between">
        <div className="logo-area">
          <Image src="/escudo-episcopal-212x300.png" alt="Escudo Episcopal" width={28} height={40} className="object-contain" />
          <div className="logo-text">
            Archivo Histórico
            <small>Diocesano</small>
          </div>
        </div>
        <Link
          href="/login"
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 no-underline transition-colors hover:border-sky-300 hover:text-sky-800"
        >
          Acceso Administrativo
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pt-5 py-20 text-center">
        {/* Escudo episcopal */}
        <Image
          src="/escudo-episcopal-212x300.png"
          alt="Escudo Episcopal Diocesano"
          width={160}
          height={130}
          className="mb-8 object-contain drop-shadow-sm"
          priority
        />

        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px w-8 bg-sky-300" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
            Diocesano - Río Cuarto
          </span>
          <div className="h-px w-8 bg-sky-300" />
        </div>

        <h1 className="mb-4 max-w-lg text-[clamp(32px,5vw,52px)] font-light leading-[1.1] tracking-tight text-slate-900">
          Archivo Histórico<br />
          <span className="font-semibold text-sky-800">Diocesano</span>
        </h1>

        <p className="mb-10 max-w-md text-base font-light leading-relaxed text-slate-500">
          Obispado Villa de la Concepción del Río Cuarto, Argentina
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/registros"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-white no-underline shadow-sm transition-colors hover:bg-sky-700"
          >
            <Search size={14} />
            Consulta de Documentos
          </Link>
          {/* <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-wider text-slate-700 no-underline transition-colors hover:border-sky-200 hover:text-sky-800"
          >
            <Shield size={14} />
            Área restringida
          </Link> */}
        </div>

        {/* Divider */}
        <div className="mt-10 flex w-full max-w-2xl items-center gap-6">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Documentacion Conservada
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Feature cards */}
        <div className="mt-8 grid w-full max-w-6xl grid-cols-3 gap-8">
          {[
            {
              icon: Archive,
              title: 'Documentos históricos',
              desc: 'Inventarios, registros y actas desde el siglo XIX',
            },
            {
              icon: BookOpen,
              title: 'Libros sacramentales',
              desc: 'Bautismos, matrimonios y defunciones parroquiales',
            },
            {
              icon: Search,
              title: 'Búsqueda avanzada',
              desc: 'Filtre por año, categoría, origen y más criterios',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-left"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Icon size={16} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-slate-800">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-10 pt-1 pb-5 text-center">
        <p className="text-[11px] tracking-wide text-slate-400">
          Archivo Histórico Diocesano
        </p>
        
      </footer>
      <footer className="border-t border-slate-100 px-10 py-5">
        <div className="flex justify-end items-center gap-1">
          <Image
            src="/isologo.png"
            alt="Logo Brix"
            width={18}
            height={20}
          />
          <small className="text-[9px] text-slate-500 font-medium">
            BrixSoftware — HL
          </small>
  </div>
</footer>
    </div>
  );
}
