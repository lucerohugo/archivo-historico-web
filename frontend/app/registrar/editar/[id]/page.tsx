'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getRegistro, updateRegistro, uploadArchivo, deleteArchivo } from '@/lib/api';

interface RegistroForm {
  arc_codi?: number;
  arc_fech: string;
  arc_titu: string;
  arc_desc: string;
  arc_orig: string;
  arc_cate: string;
  arc_año: string;
  arc_npro: string;
  arc_fechE: string;
  arc_seg: string;
  arc_tema: string;
  arc_area: string;
  arc_asun: string;
  arc_inic: string;
  arc_dest: string;
  arc_visw: 'publico' | 'privado';
  arc_grup: string;
  arc_seri: string;
  arc_sser: string;
  arc_sopo: string;
  arc_esta: string;
  arc_conA: string;
  arc_conR: string;
  arc_leng: string;
  arc_orco: string;
  arc_lugD: string;
  arc_ubsa: string;
  arc_pasi: string;
  arc_estan: string;
  arc_casi: string;
  arc_caja: string;
  arc_lega: string;
  arc_nume: string;
  arc_foli: string;
  arc_hoja: string;
  arc_cari: string;
  arc_medi: string;
  arc_obse: string;
}

type Tab = 'datos' | 'almacenamiento' | 'archivos';
const TABS: { id: Tab; label: string }[] = [
  { id: 'datos', label: 'Datos principales' },
  { id: 'almacenamiento', label: 'Almacenamiento' },
  { id: 'archivos', label: 'Archivos' },
];
const SEGMENTOS = ['Registros', 'Partidas', 'Expedientes', 'Notas', 'Otras'];
const ESTADOS = ['Excelente', 'Bueno', 'Regular', 'Malo'];
const CONDICIONES = ['Excelente', 'Bueno', 'Regular', 'Malo'];
const COND_REPRO = ['Excelente', 'Bueno', 'Regular', 'Malo'];
const ORIG_COPIA = ['Original', 'Copia'];
const SALAS = ['Archivo Histórico', 'Archivo Corriente', 'Obispado'];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-section">
      <div className="section-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function F({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`form-field${wide ? ' col-span-2' : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function EditarRegistroPage() {
  const params = useParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('datos');
  const goToTab = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<RegistroForm | null>(null);
  const [registroCompleto, setRegistroCompleto] = useState<any>(null);
  const [error, setError] = useState('');
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  const [form, setForm] = useState<RegistroForm | null>(null);

  // Cargar datos del backend
  useEffect(() => {
    const loadRegistro = async () => {
      const { data, error } = await getRegistro(Number(params.id));
      if (error) {
        setOriginal(null);
      } else if (data) {
        // Guardar registro completo para acceder a archivos
        setRegistroCompleto(data);
        
        // Mapear datos del backend al formulario
        const registroData = data as any;
        const formData: RegistroForm = {
          arc_codi: registroData.arc_codi,
          arc_fech: registroData.arc_fech || '',
          arc_titu: registroData.arc_titu || '',
          arc_desc: registroData.arc_desc || '',
          arc_orig: registroData.arc_orig || '',
          arc_cate: registroData.arc_cate || '',
          arc_año: registroData.arc_año ? String(registroData.arc_año) : '',
          arc_npro: registroData.arc_npro || '',
          arc_fechE: registroData.arc_fechE || '',
          arc_seg: registroData.arc_seg || '',
          arc_tema: registroData.arc_tema || '',
          arc_area: registroData.arc_area || '',
          arc_asun: registroData.arc_asun || '',
          arc_inic: registroData.arc_inic || '',
          arc_dest: registroData.arc_dest || '',
          arc_visw: registroData.arc_visw ? 'publico' : 'privado',
          arc_grup: registroData.arc_grup || '',
          arc_seri: registroData.arc_seri || '',
          arc_sser: registroData.arc_sser || '',
          arc_sopo: registroData.arc_sopo || '',
          arc_esta: registroData.arc_esta || '',
          arc_conA: registroData.arc_conA || '',
          arc_conR: registroData.arc_conR || '',
          arc_leng: registroData.arc_leng || '',
          arc_orco: registroData.arc_orco ? 'Original' : 'Copia',
          arc_lugD: registroData.arc_lugD || '',
          arc_ubsa: registroData.arc_ubsa || '',
          arc_pasi: registroData.arc_pasi || '',
          arc_estan: registroData.arc_estan || '',
          arc_casi: registroData.arc_casi || '',
          arc_caja: registroData.arc_caja || '',
          arc_lega: registroData.arc_lega || '',
          arc_nume: registroData.arc_nume || '',
          arc_foli: registroData.arc_foli || '',
          arc_hoja: registroData.arc_hoja || '',
          arc_cari: registroData.arc_cari || '',
          arc_medi: registroData.arc_medi || '',
          arc_obse: registroData.arc_obse || '',
        };
        setOriginal(formData);
        setForm(formData);
      }
      setLoading(false);
    };
    loadRegistro();
  }, [params.id]);

  if (loading) {
    return (
      <div className="page-container">
        <AppHeader showAdminNav />
        <div className="mx-auto max-w-md py-24 text-center">
          <AlertCircle size={36} className="mx-auto mb-4 text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-700">Cargando registro...</h2>
        </div>
      </div>
    );
  }

  if (!original || !form) {
    return (
      <div className="page-container">
        <AppHeader showAdminNav />
        <div className="mx-auto max-w-md py-24 text-center">
          <AlertCircle size={36} className="mx-auto mb-4 text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-700">Registro no encontrado</h2>
          <Link href="/admin/registros" className="btn-primary">Volver al listado</Link>
        </div>
      </div>
    );
  }

  const s = (k: keyof typeof form, v: string) => setForm((f) => f ? { ...f, [k]: v } : f);
  const addFiles = (fl: FileList | null) => { if (fl) setNewFiles((p) => [...p, ...Array.from(fl)]); };
  const submit = async () => {
    if (!form) return;
    setSaving(true);
    
    // Preparar datos para enviar al backend
    const payload: any = {
      arc_fech: form.arc_fech,
      arc_titu: form.arc_titu,
      arc_desc: form.arc_desc,
      arc_orig: form.arc_orig,
      arc_cate: form.arc_cate,
      arc_año: form.arc_año ? parseInt(form.arc_año) : null,
      arc_npro: form.arc_npro,
      arc_fechE: form.arc_fechE || null,
      arc_seg: form.arc_seg,
      arc_tema: form.arc_tema,
      arc_area: form.arc_area,
      arc_asun: form.arc_asun,
      arc_inic: form.arc_inic,
      arc_dest: form.arc_dest,
      arc_visw: form.arc_visw === 'publico',
      arc_grup: form.arc_grup,
      arc_seri: form.arc_seri,
      arc_sser: form.arc_sser,
      arc_sopo: form.arc_sopo,
      arc_esta: form.arc_esta,
      arc_conA: form.arc_conA,
      arc_conR: form.arc_conR,
      arc_leng: form.arc_leng,
      arc_orco: form.arc_orco === 'Original',
      arc_lugD: form.arc_lugD,
      arc_ubsa: form.arc_ubsa,
      arc_pasi: form.arc_pasi,
      arc_estan: form.arc_estan,
      arc_casi: form.arc_casi,
      arc_caja: form.arc_caja,
      arc_lega: form.arc_lega,
      arc_nume: form.arc_nume,
      arc_foli: form.arc_foli,
      arc_hoja: form.arc_hoja,
      arc_cari: form.arc_cari,
      arc_medi: form.arc_medi,
      arc_obse: form.arc_obse,
    };

    setError('');
    const { error: updateError } = await updateRegistro(Number(params.id), payload);

    if (updateError) {
      setSaving(false);
      setError(updateError);
      return;
    }

    if (newFiles.length > 0) {
      const uploads = await Promise.all(newFiles.map((f) => uploadArchivo(Number(params.id), f)));
      const exitosos = newFiles.filter((_, i) => !uploads[i].error);
      const fallidos = uploads.filter((u) => u.error);

      setNewFiles((prev) => prev.filter((f) => !exitosos.includes(f)));
      setSaving(false);

      if (fallidos.length > 0) {
        setError(`Los datos se guardaron, pero fallaron ${fallidos.length} de ${newFiles.length} archivo(s). Presione "Guardar cambios" nuevamente para reintentar la carga.`);
        setTab('archivos');
        return;
      }
    } else {
      setSaving(false);
    }

    router.push('/admin/registros');
  };

  const removeExistingFile = async (id: number) => {
    setDeletingFileId(id);
    const { error: deleteError } = await deleteArchivo(id);
    setDeletingFileId(null);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    setRegistroCompleto((r: any) => r ? { ...r, archivos: r.archivos.filter((a: any) => a.id !== id) } : r);
  };

  return (
    <div className="page-container">
      <AppHeader showAdminNav breadcrumb={[{ label: 'Panel', href: '/registrar' }, { label: 'Registros', href: '/admin/registros' }, { label: `Editar N° ${original.arc_codi}` }]} />
      <div className="content-wrapper pb-20 pt-9">
        <div className="mb-8 text-center">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700">
            Registro N° {original.arc_codi}
          </p>
          <h1 className="text-xl font-semibold text-slate-900">Editar registro histórico</h1>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="tab-nav">
          {TABS.map((t, i) => (
            <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${tab === t.id ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'datos' && (
          <div>
            <Card title="Datos principales de registro">
              <div className="form-grid-2">
                <F label="Fecha"><input className="form-input" type="date" value={form.arc_fech} onChange={(e) => s('arc_fech', e.target.value)} /></F>
                <F label="Título"><input className="form-input" type="text" value={form.arc_titu} onChange={(e) => s('arc_titu', e.target.value)} /></F>
                <F label="Descripción" wide><textarea className="form-textarea" value={form.arc_desc} onChange={(e) => s('arc_desc', e.target.value)} rows={3} /></F>
              </div>
            </Card>
            <Card title="Referencias y clasificación">
              <div className="form-grid-2">
                <F label="Origen"><input className="form-input" type="text" value={form.arc_orig} onChange={(e) => s('arc_orig', e.target.value)} /></F>
                <F label="Categoría"><input className="form-input" type="text" value={form.arc_cate} onChange={(e) => s('arc_cate', e.target.value)} /></F>
              </div>
            </Card>
            <Card title="Numeración y fechas">
              <div className="form-grid-4">
                <F label="Año"><input className="form-input" type="number" value={form.arc_año} onChange={(e) => s('arc_año', e.target.value)} /></F>
                <F label="Número protocolar"><input className="form-input" type="text" value={form.arc_npro} onChange={(e) => s('arc_npro', e.target.value)} /></F>
                <F label="Fecha exacta"><input className="form-input" type="date" value={form.arc_fechE} onChange={(e) => s('arc_fechE', e.target.value)} /></F>
                <F label="Segmento"><select className="form-select" value={form.arc_seg} onChange={(e) => s('arc_seg', e.target.value)}><option value="">Seleccionar</option>{SEGMENTOS.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
              </div>
            </Card>
            <Card title="Asunto y alcances">
              <div className="form-grid-2">
                <F label="Tema"><input className="form-input" type="text" value={form.arc_tema} onChange={(e) => s('arc_tema', e.target.value)} /></F>
                <F label="Área"><input className="form-input" type="text" value={form.arc_area} onChange={(e) => s('arc_area', e.target.value)} /></F>
                <F label="Asunto" wide><input className="form-input" type="text" value={form.arc_asun} onChange={(e) => s('arc_asun', e.target.value)} /></F>
                <F label="Iniciador"><input className="form-input" type="text" value={form.arc_inic} onChange={(e) => s('arc_inic', e.target.value)} /></F>
                <F label="Destinatario"><input className="form-input" type="text" value={form.arc_dest} onChange={(e) => s('arc_dest', e.target.value)} /></F>
              </div>
            </Card>
          </div>
        )}

        {tab === 'almacenamiento' && (
          <div>
            <Card title="Grupos y series">
              <div className="form-grid-3">
                <F label="Grupo"><input className="form-input" type="text" value={form.arc_grup} onChange={(e) => s('arc_grup', e.target.value)} /></F>
                <F label="Serie"><input className="form-input" type="text" value={form.arc_seri} onChange={(e) => s('arc_seri', e.target.value)} /></F>
                <F label="Sub serie"><input className="form-input" type="text" value={form.arc_sser} onChange={(e) => s('arc_sser', e.target.value)} /></F>
              </div>
            </Card>
            <Card title="Conservación y ubicación">
              <div className="flex flex-col gap-5">
                <div className="form-grid-2">
                  <F label="Soporte"><input className="form-input" type="text" value={form.arc_sopo} onChange={(e) => s('arc_sopo', e.target.value)} /></F>
                  <F label="Estado"><select className="form-select" value={form.arc_esta} onChange={(e) => s('arc_esta', e.target.value)}>{ESTADOS.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Cond. de acceso"><select className="form-select" value={form.arc_conA} onChange={(e) => s('arc_conA', e.target.value)}>{CONDICIONES.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Cond. de reproducción"><select className="form-select" value={form.arc_conR} onChange={(e) => s('arc_conR', e.target.value)}>{COND_REPRO.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Lengua"><input className="form-input" type="text" value={form.arc_leng} onChange={(e) => s('arc_leng', e.target.value)} /></F>
                  <F label="Original / Copia"><select className="form-select" value={form.arc_orco} onChange={(e) => s('arc_orco', e.target.value)}>{ORIG_COPIA.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Lugar destino"><input className="form-input" type="text" value={form.arc_lugD} onChange={(e) => s('arc_lugD', e.target.value)} /></F>
                  <F label="Ubicación sala"><select className="form-select" value={form.arc_ubsa} onChange={(e) => s('arc_ubsa', e.target.value)}>{SALAS.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Localización exacta</p>
                  <div className="form-grid-3">
                    <F label="Pasillo"><input className="form-input" type="text" value={form.arc_pasi} onChange={(e) => s('arc_pasi', e.target.value)} /></F>
                    <F label="Estantería"><input className="form-input" type="text" value={form.arc_estan} onChange={(e) => s('arc_estan', e.target.value)} /></F>
                    <F label="Casillero"><input className="form-input" type="text" value={form.arc_casi} onChange={(e) => s('arc_casi', e.target.value)} /></F>
                    <F label="Caja N°"><input className="form-input" type="text" value={form.arc_caja} onChange={(e) => s('arc_caja', e.target.value)} /></F>
                    <F label="Legajo"><input className="form-input" type="text" value={form.arc_lega} onChange={(e) => s('arc_lega', e.target.value)} /></F>
                    <F label="Número"><input className="form-input" type="text" value={form.arc_nume} onChange={(e) => s('arc_nume', e.target.value)} /></F>
                    <F label="Folios"><input className="form-input" type="text" value={form.arc_foli} onChange={(e) => s('arc_foli', e.target.value)} /></F>
                    <F label="Hojas"><input className="form-input" type="text" value={form.arc_hoja} onChange={(e) => s('arc_hoja', e.target.value)} /></F>
                    <F label="Carillas"><input className="form-input" type="text" value={form.arc_cari} onChange={(e) => s('arc_cari', e.target.value)} /></F>
                    <F label="Medidas"><input className="form-input" type="text" value={form.arc_medi} onChange={(e) => s('arc_medi', e.target.value)} /></F>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Nota del archivero">
              <textarea className="form-textarea" value={form.arc_obse} onChange={(e) => s('arc_obse', e.target.value)} rows={4} />
            </Card>
          </div>
        )}

        {tab === 'archivos' && (
          <div className="card-section">
            <div className="section-header">Archivos adjuntos</div>
            <div className="card-body">
              {registroCompleto && registroCompleto.archivos && registroCompleto.archivos.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                  {registroCompleto.archivos.map((a: any) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-800 text-white"><FileText size={13} /></div>
                      <a href={a.archivo} target="_blank" rel="noopener noreferrer" className="flex-1 no-underline">
                        <p className="text-sm font-medium text-slate-800 hover:text-sky-700">{a.nombre}</p>
                        <p className="text-xs text-slate-400">{a.tipo}</p>
                      </a>
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-600">Existente</span>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(a.id)}
                        disabled={deletingFileId === a.id}
                        className="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById('fi-e')?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all ${dragOver ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/30'}`}
              >
                <Upload size={22} className={`mx-auto mb-2.5 ${dragOver ? 'text-sky-500' : 'text-slate-300'}`} />
                <p className="text-sm font-medium text-slate-600">Agregar nuevos archivos</p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</p>
                <input id="fi-e" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </div>
              {newFiles.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {newFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-sky-100 bg-sky-50 px-4 py-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700 text-white"><FileText size={13} /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{f.name}</p>
                        <p className="text-xs text-sky-600">Nuevo — {(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={() => setNewFiles((fl) => fl.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Card title="Visibilidad">
              <div className="flex gap-3">
                {[{ v: 'publico', label: 'Público', desc: 'Visible para todos' }, { v: 'privado', label: 'Privado', desc: 'Solo administradores' }].map((opt) => (
                  <label key={opt.v} className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${form.arc_visw === opt.v ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <input type="radio" name="visibilidad" value={opt.v} checked={form.arc_visw === opt.v} onChange={(e) => s('arc_visw', e.target.value as 'publico' | 'privado')} className="accent-sky-700" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card> 
          </div>
        )}

          
        

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          <Link href="/admin/registros" className="btn-back">Cancelar</Link>
          <div className="flex items-center gap-2.5">
            {tab !== 'datos' && <button className="btn-secondary" onClick={() => goToTab(tab === 'archivos' ? 'almacenamiento' : 'datos')}> Anterior</button>}
            {tab !== 'archivos' ? (
              <button className="btn-primary" onClick={() => goToTab(tab === 'datos' ? 'almacenamiento' : 'archivos')}>Siguiente</button>
            ) : (
              <button className="btn-primary" onClick={submit} disabled={saving}>
                {saving ? 'Guardando...' : <><CheckCircle size={13} /> Guardar cambios</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
