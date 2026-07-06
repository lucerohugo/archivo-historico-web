'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getRegistrosPublicos } from '@/lib/api';

interface RegistroPublico {
  arc_codi: number;
  arc_titu: string;
  arc_desc?: string;
  arc_año?: number;
  arc_orig?: string;
  arc_cate?: string;
  arc_fech: string;
}

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<RegistroPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [anioFilter, setAnioFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Cargar registros públicos del backend
  useEffect(() => {
    const loadRegistros = async () => {
      setLoading(true);
      const result = await getRegistrosPublicos();
      if (result.data) {
        const data = result.data;
        // Manejar si la API retorna un array o un objeto con resultados
        const registrosArray = Array.isArray(data) ? data : (data.results || []);
        setRegistros(registrosArray as RegistroPublico[]);
      }
      setLoading(false);
    };
    loadRegistros();
  }, []);

  const allYears = useMemo(() => {
    return Array.from(new Set(registros.map((r) => r.arc_año).filter(Boolean))).sort((a, b) => (b || 0) - (a || 0));
  }, [registros]);

  const allCategorias = useMemo(() => {
    return Array.from(new Set(registros.map((r) => r.arc_cate).filter(Boolean)));
  }, [registros]);

  const filtered = useMemo(() => {
    return registros.filter((r) => {
      const q = query.toLowerCase();
      const matchQ = !q || r.arc_titu.toLowerCase().includes(q) || String(r.arc_codi).includes(q) || r.arc_orig?.toLowerCase().includes(q) || r.arc_desc?.toLowerCase().includes(q) || String(r.arc_año).includes(q);
      const matchA = !anioFilter || String(r.arc_año) === anioFilter;
      const matchC = !catFilter || r.arc_cate === catFilter;
      return matchQ && matchA && matchC;
    });
  }, [registros, query, anioFilter, catFilter]);

  const hasFilters = query || anioFilter || catFilter;

  return (
    <div className="page-container">
      <AppHeader />
      <div className="content-wrapper pb-16 pt-10">
        {/* Page header */}
        <div className="page-header">
          <Link href="/" className="btn-back mb-4 inline-flex ">
            Inicio
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                documentacion conservada
              </p>
              <h1 className="page-title">Registros Históricos</h1>
              <p className="page-subtitle">
                {registros.length} documentos disponibles
              </p>
            </div>
            {/* <Link href="/" className="btn-back">Inicio</Link> */}
          </div>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="filter-label">Buscar</label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título, código, origen..."
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <label className="filter-label">Año</label>
              <select className="form-select" value={anioFilter} onChange={(e) => setAnioFilter(e.target.value)}>
                <option value="">Todos los años</option>
                {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="min-w-[180px]">
              <label className="filter-label">Categoría</label>
              <select className="form-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">Todas las categorías</option>
                {allCategorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button
                onClick={() => { setQuery(''); setAnioFilter(''); setCatFilter(''); }}
                className="btn-secondary"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={36} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-400">Cargando registros...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={36} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-400">Sin resultados</p>
            <p className="mt-1 text-sm text-slate-400">
              No se encontraron registros con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((r) => (
              <Link key={r.arc_codi} href={`/registros/${r.arc_codi}`} className="no-underline">
                <div className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md">
                  {/* Code badge */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-sky-100 bg-sky-50">
                    <span className="text-[8px] font-bold uppercase text-sky-500">N°</span>
                    <span className="text-lg font-bold leading-none text-sky-800">{r.arc_codi}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      {r.arc_cate && (
                        <span className="rounded border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                          {r.arc_cate}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {r.arc_año || '—'} · {r.arc_orig || '—'}
                      </span>
                    </div>

                    <h2 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                      {r.arc_titu}
                    </h2>

                    {r.arc_desc && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {r.arc_desc}
                      </p>
                    )}
                  </div>

                  <ChevronRight size={15} className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-sky-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="mt-6 text-center text-[11px] text-slate-400">
            Mostrando {filtered.length} de {registros.length} registros
          </p>
        )}
      </div>
    </div>
  );
}
