'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PlusCircle, List, BookOpen, Archive, FileText } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getRegistros } from '@/lib/api';

interface Registro {
  arc_codi: number;
  arc_fech: string;
  arc_titu: string;
  arc_año: number;
  arc_visw: boolean;
  archivos: Array<{ id: number; nombre: string; tipo: string; archivo: string }>;
}

export default function RegistrarPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistros = async () => {
      const { data, error } = await getRegistros();
      if (data) {
        const registrosArray = Array.isArray(data) ? data : (data.results || []);
        setRegistros(registrosArray);
      }
      setLoading(false);
    };
    loadRegistros();
  }, []);

  const publicCount = registros.filter((r) => r.arc_visw === true).length;
  const privateCount = registros.filter((r) => r.arc_visw === false).length;
  const recent = registros.slice(0, 5);

  return (
    <div className="page-container">
      <AppHeader showAdminNav />
      <div className="content-wrapper pb-16 pt-12">
        {/* Heading */}
        <div className="mb-10">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
            Panel de administración
          </p>
          <h1 className="page-title">Archivo Histórico Diocesano</h1>
          <p className="page-subtitle">Sistema de gestión de documentos históricos</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Total de registros', value: registros.length, icon: Archive, color: 'text-sky-800', bg: 'bg-sky-50' },
            { label: 'Registros públicos', value: publicCount, icon: BookOpen, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Registros privados', value: privateCount, icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={19} className={color} />
              </div>
              <div>
                <p className="text-3xl font-semibold leading-none text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <Link href="/registrar/crear" className="no-underline">
            <div className="flex items-center gap-4 rounded-xl bg-sky-800 p-7 shadow-sm transition-all hover:bg-sky-700 hover:shadow-md cursor-pointer">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <PlusCircle size={22} className="text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Cargar nuevo archivo</p>
                <p className="mt-0.5 text-xs text-sky-200">Crear un nuevo registro histórico</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/registros" className="no-underline">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:border-sky-200 hover:shadow-md cursor-pointer">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50">
                <List size={22} className="text-sky-700" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Todos los registros</p>
                <p className="mt-0.5 text-xs text-slate-500">Gestionar registros editar o borrar</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent table */}
        <div className="card-section">
          <div className="section-header">Últimos registros cargados</div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Título referencia</th>
                  <th>Año</th>
                  <th>Visibilidad</th>
                  <th>Archivos</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-slate-500">
                      Cargando registros...
                    </td>
                  </tr>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-slate-500">
                      No hay registros aún
                    </td>
                  </tr>
                ) : (
                  recent.map((r) => (
                    <tr key={r.arc_codi}>
                      <td>
                        <Link href={`/registrar/editar/${r.arc_codi}`} className="font-semibold text-sky-700 no-underline hover:text-sky-800">
                          {r.arc_codi}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-xs text-slate-500">{r.arc_fech}</td>
                      <td className="max-w-xs">
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                          {r.arc_titu}
                        </span>
                      </td>
                      <td className="font-medium">{r.arc_año}</td>
                      <td>
                        <span className={r.arc_visw ? 'badge-public' : 'badge-private'}>
                          {r.arc_visw ? 'Público' : 'Privado'}
                        </span>
                      </td>
                      <td>
                        {r.archivos && r.archivos.length > 0
                          ? r.archivos.map((a) => (
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
                          : <span className="text-xs text-slate-400">—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* <div className="flex justify-end border-t border-slate-100 px-4 py-3">
            <Link href="/admin/registros" className="text-xs font-semibold text-sky-700 no-underline hover:text-sky-800">
              Ver todos los registros ss
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
