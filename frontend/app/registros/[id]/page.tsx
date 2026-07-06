'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, MapPin, FileText, Archive, Download, Eye, AlertCircle, Loader } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getRegistroPublico } from '@/lib/api';

interface Registro {
  arc_codi: number;
  arc_titu: string;
  arc_desc?: string;
  arc_cate?: string;
  arc_año?: number;
  arc_fech?: string;
  arc_orig?: string;
  arc_npro?: string;
  arc_seg?: string;
  arc_tema?: string;
  arc_area?: string;
  arc_asun?: string;
  arc_inic?: string;
  arc_dest?: string;
  arc_sopo?: string;
  arc_esta?: string;
  arc_leng?: string;
  arc_orco?: boolean;
  arc_conA?: string;
  arc_conR?: string;
  arc_foli?: string;
  arc_hoja?: string;
  arc_medi?: string;
  arc_ubsa?: string;
  arc_grup?: string;
  arc_seri?: string;
  arc_sser?: string;
  arc_pasi?: string;
  arc_estan?: string;
  arc_casi?: string;
  arc_caja?: string;
  arc_lega?: string;
  arc_nume?: string;
  arc_obse?: string;
  arc_visw: boolean;
  archivos: any[];
}

function Field({ label, value }: { label: string; value?: string | number | boolean }) {
  if (!value) return null;
  const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{displayValue}</span>
    </div>
  );
}

async function handleDownload(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se pudo descargar el archivo');
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Si falla (ej. CORS), como último recurso abrimos el archivo en una pestaña nueva
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export default function RegistroDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRegistro = async () => {
      try {
        const { data, error } = await getRegistroPublico(id);
        if (error) {
          setError(error);
        } else {
          setRegistro((data as Registro) ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    loadRegistro();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <AppHeader />
        <div className="mx-auto max-w-md py-24 text-center">
          <Loader size={36} className="mx-auto mb-4 animate-spin text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-700">Cargando registro...</h2>
        </div>
      </div>
    );
  }

  if (!registro || !registro.arc_visw) {
    return (
      <div className="page-container">
        <AppHeader />
        <div className="mx-auto max-w-md py-24 text-center">
          <AlertCircle size={36} className="mx-auto mb-4 text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-700">Registro no encontrado</h2>
          <p className="mb-6 text-sm text-slate-500">
            Este registro no existe o no está disponible públicamente.
          </p>
          <Link href="/registros" className="btn-primary">Volver al archivo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <AppHeader breadcrumb={[{ label: 'Registros', href: '/registros' }, { label: `N° ${registro.arc_codi}` }]} />
      <div className="content-wrapper pb-16 pt-10">
        {/* Page header */}
        <div className="page-header">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {registro.arc_cate && (
              <span className="rounded border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                {registro.arc_cate}
              </span>
            )}
            <span className="text-xs text-slate-400">Registro N° {registro.arc_codi}</span>
          </div>
          <h1 className="max-w-10xl text-2xl font-semibold leading-snug text-slate-900">
            {registro.arc_titu}
          </h1>
          {registro.arc_desc && (
            <p className="mt-3 max-w-10xl text-sm leading-relaxed text-slate-500">
              {registro.arc_desc}
            </p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Main */}
          <div>
            {/* Datos principales */}
            <div className="card-section">
              <div className="section-header flex items-center gap-2">
                <BookOpen size={11} />
                Datos principales
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Año del documento" value={registro.arc_año} />
                  <Field label="Fecha de recepción" value={registro.arc_fech} />
                  <Field label="Origen" value={registro.arc_orig} />
                  <Field label="Categoría" value={registro.arc_cate} />
                  <Field label="N° Protocolar" value={registro.arc_npro} />
                  <Field label="Segmento" value={registro.arc_seg} />
                  {registro.arc_tema && <Field label="Tema" value={registro.arc_tema} />}
                  {registro.arc_area && <Field label="Área" value={registro.arc_area} />}
                  {registro.arc_asun && <div className="col-span-2"><Field label="Asunto" value={registro.arc_asun} /></div>}
                  {registro.arc_inic && <Field label="Iniciador" value={registro.arc_inic} />}
                  {registro.arc_dest && <Field label="Destinatarios" value={registro.arc_dest} />}
                </div>
              </div>
            </div>

            {/* Conservación */}
            <div className="card-section">
              <div className="section-header flex items-center gap-2">
                <Archive size={11} />
                Conservación y características
              </div>
              <div className="card-body">
                <div className="grid grid-cols-3 gap-5">
                  <Field label="Soporte" value={registro.arc_sopo} />
                  <Field label="Estado de conservación" value={registro.arc_esta} />
                  <Field label="Lengua / Escritura" value={registro.arc_leng} />
                  <Field label="Original / Copia" value={registro.arc_orco} />
                  <Field label="Condición de acceso" value={registro.arc_conA} />
                  <Field label="Cond. reproducción" value={registro.arc_conR} />
                  {registro.arc_foli && <Field label="Folios" value={registro.arc_foli} />}
                  {registro.arc_hoja && <Field label="Hojas" value={registro.arc_hoja} />}
                  {registro.arc_medi && <Field label="Medidas" value={registro.arc_medi} />}
                </div>
              </div>
            </div>

            {/* Archivos */}
            {registro.archivos && registro.archivos.length > 0 && (
              <div className="card-section">
                <div className="section-header flex items-center gap-2">
                  <FileText size={11} />
                  Archivos adjuntos ({registro.archivos.length})
                </div>
                <div className="card-body flex flex-col gap-2">
                  {registro.archivos.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-800 text-white">
                        <FileText size={13} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{a.nombre}</p>
                        <p className="text-xs text-slate-400">{a.tipo}</p>
                      </div>
                      <a
                        href={a.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 transition-colors"
                      >
                        <Eye size={12} />
                        VER
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownload(a.archivo, a.nombre)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800 transition-colors"
                      >
                        <Download size={12} />
                        Descargar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card-section">
              <div className="section-header flex items-center gap-2">
                <MapPin size={11} />
                Ubicación física
              </div>
              <div className="card-body flex flex-col gap-4">
                <Field label="Sala" value={registro.arc_ubsa} />
                <Field label="Grupo" value={registro.arc_grup} />
                <Field label="Serie" value={registro.arc_seri} />
                {registro.arc_sser && <Field label="Sub serie" value={registro.arc_sser} />}
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  {registro.arc_pasi && <Field label="Pasillo" value={registro.arc_pasi} />}
                  {registro.arc_estan && <Field label="Estantería" value={registro.arc_estan} />}
                  {registro.arc_casi && <Field label="Casillero" value={registro.arc_casi} />}
                  {registro.arc_caja && <Field label="Caja N°" value={registro.arc_caja} />}
                  {registro.arc_lega && <Field label="Legajo" value={registro.arc_lega} />}
                  {registro.arc_nume && <Field label="N° Registro" value={registro.arc_nume} />}
                </div>
              </div>
            </div>

            {registro.arc_obse && (
              <div className="card-section">
                <div className="section-header">Nota del archivero</div>
                <div className="card-body">
                  <p className="text-xs italic leading-relaxed text-slate-500">
                    &ldquo;{registro.arc_obse}&rdquo;
                  </p>
                </div>
              </div>
            )}

            <Link href="/registros" className="btn-back flex w-full justify-center">
              Volver al archivo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
