'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getRegistrosPublicos, getRegistrosPublicosCategorias } from '@/lib/api';

const PAGE_SIZE = 50;

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
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<string[]>([]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);

  // Cargar la lista de categorías una sola vez
  useEffect(() => {
    getRegistrosPublicosCategorias().then((result) => {
      if (result.data) setCategorias(result.data);
    });
  }, []);

  // Debounce del buscador: espera 300ms sin escritura antes de disparar la búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Al cambiar cualquier filtro, volver a la página 1
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, dateFrom, dateTo, catFilter]);

  // Traer del backend la página correspondiente según búsqueda/filtros actuales
  useEffect(() => {
    let cancelled = false;
    const loadRegistros = async () => {
      setLoading(true);
      const result = await getRegistrosPublicos({
        page,
        search: debouncedQuery || undefined,
        fechaDesde: dateFrom || undefined,
        fechaHasta: dateTo || undefined,
        categoria: catFilter || undefined,
      });
      if (cancelled) return;
      if (result.data) {
        setRegistros((result.data.results || []) as unknown as RegistroPublico[]);
        setCount(result.data.count ?? 0);
      }
      setLoading(false);
    };
    loadRegistros();
    return () => { cancelled = true; };
  }, [page, debouncedQuery, dateFrom, dateTo, catFilter]);

  const hasFilters = query || dateFrom || dateTo || catFilter;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const clearFilters = () => {
    setQuery('');
    setDateFrom('');
    setDateTo('');
    setCatFilter('');
  };

  return (
    <div className="page-container">
      <AppHeader />
      <div className="content-wrapper pb-16 pt-10">
        {/* Page header */}
        <div className="page-header">
          <Link href="/" className="btn-primary mb-4 inline-flex ">
            Inicio
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                documentacion conservada
              </p>
              <h1 className="page-title">Registros Históricos</h1>
              <p className="page-subtitle">
                {count} documentos disponibles
              </p>
            </div>
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
                  placeholder="Buscar por título o año..."
                />
              </div>
            </div>
            {/* filtros comentados 8/7/2026 */}
            {/* <div className="min-w-[140px]">
              <label className="filter-label">Fecha desde</label>
              <input className="form-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="min-w-[140px]">
              <label className="filter-label">Fecha hasta</label>
              <input className="form-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="min-w-[180px]">
              <label className="filter-label">Categoría</label>
              <select className="form-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div> */}
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary">
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
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={36} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-400">Sin resultados</p>
            <p className="mt-1 text-sm text-slate-400">
              No se encontraron registros con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {registros.map((r) => (
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
                      <span className="text-sm font-semibold text-slate-500">
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

        {!loading && count > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <span className="text-[11px] text-slate-400">
              Página {page} de {totalPages} · {count} registros
            </span>
            <button
              className="btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
