'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, Trash2, Pencil, PlusCircle, ChevronUp, ChevronDown } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getRegistros, deleteRegistro } from '@/lib/api';

interface Registro {
  arc_codi: number;
  arc_titu: string;
  arc_fech: string;
  arc_año?: number;
  arc_visw?: boolean;
  archivos?: Array<{ id: number; nombre: string; tipo: string; archivo: string }>;
}

type SortKey = 'arc_codi' | 'arc_fech' | 'arc_año';
type SortDir = 'asc' | 'desc';

export default function AdminRegistrosPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [anioFilter, setAnioFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('arc_codi');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Cargar registros del backend
  useEffect(() => {
    const loadRegistros = async () => {
      setLoading(true);
      const result = await getRegistros();
      if (result.data) {
        const data = result.data;
        // Manejar si la API retorna un array o un objeto con resultados
        const registrosArray = Array.isArray(data) ? data : (data.results ?? []);
        setRegistros(registrosArray as Registro[]);
      }
      setLoading(false);
    };
    loadRegistros();
  }, []);

  const allYears = useMemo(() => {
    return Array.from(new Set(registros.map((r) => r.arc_año).filter(Boolean))).sort((a, b) => (b || 0) - (a || 0));
  }, [registros]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let list = registros.filter((r) => {
      const q = query.toLowerCase();
      const matchQuery = !q || r.arc_titu.toLowerCase().includes(q) || String(r.arc_codi).includes(q) || String(r.arc_año).includes(q);
      const matchAnio = !anioFilter || String(r.arc_año) === anioFilter;
      const matchFrom = !dateFrom || r.arc_fech >= dateFrom;
      const matchTo = !dateTo || r.arc_fech <= dateTo;
      return matchQuery && matchAnio && matchFrom && matchTo;
    });
    list = [...list].sort((a, b) => {
      const av = sortKey === 'arc_codi' ? a.arc_codi : sortKey === 'arc_año' ? (a.arc_año ?? 0) : a.arc_fech;
      const bv = sortKey === 'arc_codi' ? b.arc_codi : sortKey === 'arc_año' ? (b.arc_año ?? 0) : b.arc_fech;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [registros, query, anioFilter, dateFrom, dateTo, sortKey, sortDir]);

  const handleDelete = async (id: number) => {
    const result = await deleteRegistro(id);
    if (!result.error) {
      setRegistros((r) => r.filter((reg) => reg.arc_codi !== id));
    }
    setDeleteConfirm(null);
  };

  const clearFilters = () => { setQuery(''); setAnioFilter(''); setDateFrom(''); setDateTo(''); };
  const hasFilters = query || anioFilter || dateFrom || dateTo;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={10} className="opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  }

  return (
    <div className="page-container">
      <AppHeader
        showAdminNav
        breadcrumb={[
          { label: 'Panel', href: '/registrar' },
          { label: 'Todos los registros' },
        ]}
      />

      <div className="content-wrapper pb-16 pt-10">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                Administración
              </p>
              <h1 className="page-title">Todos los registros históricos</h1>
              <p className="page-subtitle">{registros.length} registros en total — públicos y privados</p>
            </div>
            <Link href="/registrar/crear" className="btn-primary">
              <PlusCircle size={14} />
              Nuevo registro
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Buscar y filtrar
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-[2]">
              <label className="filter-label">Buscar</label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por código, título o año..."
                />
              </div>
            </div>
            <div className="min-w-[140px]">
              <label className="filter-label">
                <Calendar size={10} className="mr-1 inline" />
                Filtrar por año
              </label>
              <select className="form-select" value={anioFilter} onChange={(e) => setAnioFilter(e.target.value)}>
                <option value="">Todos los años</option>
                {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="min-w-[140px]">
              <label className="filter-label">Fecha desde</label>
              <input className="form-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="min-w-[140px]">
              <label className="filter-label">Fecha hasta</label>
              <input className="form-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary">Limpiar</button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card-section">
          {loading ? (
            <div className="py-10 text-center text-slate-400">Cargando registros...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => toggleSort('arc_codi')}
                          className="flex items-center gap-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-[0.1em] text-white cursor-pointer"
                        >
                          Código <SortIcon col="arc_codi" />
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => toggleSort('arc_fech')}
                          className="flex items-center gap-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-[0.1em] text-white cursor-pointer"
                        >
                          Fecha <SortIcon col="arc_fech" />
                        </button>
                      </th>
                      <th>Título</th>
                      <th>
                        <button
                          onClick={() => toggleSort('arc_año')}
                          className="flex items-center gap-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-[0.1em] text-white cursor-pointer"
                        >
                          Año <SortIcon col="arc_año" />
                        </button>
                      </th>
                      <th>Visibilidad</th>
                      <th>Archivos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                          No se encontraron registros.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr key={r.arc_codi}>
                          <td>
                            <span className="text-[13px] font-bold text-sky-700">{r.arc_codi}</span>
                          </td>
                          <td className="whitespace-nowrap text-xs text-slate-500">
                            {r.arc_fech}
                          </td>
                          <td className="max-w-[380px]">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-slate-800">
                              {r.arc_titu}
                            </span>
                          </td>
                          <td className="font-semibold text-slate-800">{r.arc_año || '—'}</td>
                          <td>
                            <span className={r.arc_visw ? 'badge-public' : 'badge-private'}>
                              {r.arc_visw ? 'Público' : 'Privado'}
                            </span>
                          </td>

                          <td>
                            {r.archivos && r.archivos.length > 0 ? (
                              r.archivos.map((a) => (
                                <a
                                  key={a.id}
                                  href={a.archivo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={a.nombre}
                                  className="badge-file no-underline cursor-pointer transition-opacity hover:opacity-80"
                                >
                                  {a.tipo}
                                </a>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td>
                            <div className="flex items-center gap-1.5">
                              <Link href={`/registrar/editar/${r.arc_codi}`} className="btn-edit no-underline">
                                <Pencil size={11} />
                                Editar
                              </Link>

                              {deleteConfirm === r.arc_codi ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    className="btn-danger text-[10px] px-2 py-1"
                                    onClick={() => handleDelete(r.arc_codi)}
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    className="btn-secondary text-[10px] px-2 py-1"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn-danger"
                                  onClick={() => setDeleteConfirm(r.arc_codi)}
                                >
                                  <Trash2 size={11} />
                                  Borrar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filtered.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="text-[11px] text-slate-400">
                    {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
