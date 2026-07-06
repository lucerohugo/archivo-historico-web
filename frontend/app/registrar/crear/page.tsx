'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { createRegistro, uploadArchivo } from '@/lib/api';

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

// NOMBRES DE CAMPOS EXACTOS DEL BACKEND DJANGO
const INIT = {
  arc_fech: new Date().toISOString().split('T')[0],
  arc_titu: '',
  arc_desc: '',
  arc_orig: '',
  arc_cate: '',
  arc_año: String(new Date().getFullYear()),
  arc_npro: '',
  arc_fechE: '',
  arc_seg: '',
  arc_tema: '',
  arc_area: '',
  arc_asun: '',
  arc_inic: '',
  arc_dest: '',
  arc_visw: 'publico' as 'publico' | 'privado',
  arc_grup: '',
  arc_seri: '',
  arc_sser: '',
  arc_sopo: '',
  arc_esta: 'Excelente',
  arc_conA: 'Excelente',
  arc_conR: 'Excelente',
  arc_leng: '',
  arc_orco: 'Original',
  arc_lugD: '',
  arc_ubsa: 'Archivo Histórico',
  arc_pasi: '',
  arc_estan: '',
  arc_casi: '',
  arc_caja: '',
  arc_lega: '',
  arc_nume: '',
  arc_foli: '',
  arc_hoja: '',
  arc_cari: '',
  arc_medi: '',
  arc_obse: '',
};

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

export default function CrearRegistroPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('datos');
  const [form, setForm] = useState(INIT);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState<number | null>(null);

  const s = (k: keyof typeof INIT, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const addFiles = (fl: FileList | null) => {
    if (fl) setFiles((p) => [...p, ...Array.from(fl)]);
  };

  const submit = async () => {
    if (!form.arc_titu) {
      setError('El título de referencia es obligatorio.');
      setTab('datos');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Si el registro ya fue creado (reintento tras un fallo de subida),
      // no lo volvemos a crear: solo reintentamos subir los archivos pendientes.
      let registroId = createdId;

      if (registroId === null) {
        // Construir payload con nombres de Django
        const payload = {
          arc_fech: form.arc_fech,
          arc_titu: form.arc_titu,
          arc_desc: form.arc_desc,
          arc_orig: form.arc_orig,
          arc_cate: form.arc_cate,
          arc_año: form.arc_año ? parseInt(form.arc_año) : null,
          arc_npro: form.arc_npro,
          arc_seg: form.arc_seg,
          arc_tema: form.arc_tema,
          arc_area: form.arc_area,
          arc_asun: form.arc_asun,
          arc_inic: form.arc_inic,
          arc_dest: form.arc_dest,
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
          arc_visw: form.arc_visw === 'publico',
          arc_acti: true,
        };

        const result = await createRegistro(payload);

        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }

        registroId = (result.data as any)?.arc_codi ?? null;
        setCreatedId(registroId);
      }

      if (registroId && files.length > 0) {
        const uploads = await Promise.all(files.map((f) => uploadArchivo(registroId as number, f)));
        const exitosos = files.filter((_, i) => !uploads[i].error);
        const fallidos = uploads.filter((u) => u.error);

        // Sacamos de la lista los que ya se subieron, para no reintentarlos
        setFiles((prev) => prev.filter((f) => !exitosos.includes(f)));

        if (fallidos.length > 0) {
          setSaving(false);
          setError(`El registro se guardó, pero fallaron ${fallidos.length} de ${files.length} archivo(s). Presione "Aceptar y confirmar registro" nuevamente para reintentar solo la carga de archivos.`);
          setTab('archivos');
          return;
        }
      }

      router.push('/admin/registros');
    } catch (err) {
      setError('Error al guardar el registro');
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <AppHeader showAdminNav breadcrumb={[{ label: 'Panel', href: '/registrar' }, { label: 'Nuevo registro' }]} />
      <div className="content-wrapper pb-20 pt-9">
        <h1 className="mb-8 text-center text-xl font-semibold text-slate-900">
          Crear nuevo registro histórico
        </h1>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="tab-nav">
          {TABS.map((t, i) => (
            <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span className={`mr-2 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold ${tab === t.id ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Datos principales ── */}
        {tab === 'datos' && (
          <div>
            <Card title="Datos principales de registro">
              <div className="form-grid-2">
                <F label="Fecha de recepción">
                  <input className="form-input" type="date" value={form.arc_fech} onChange={(e) => s('arc_fech', e.target.value)} />
                </F>
                <F label="Título referencia">
                  <input className="form-input" type="text" value={form.arc_titu} onChange={(e) => s('arc_titu', e.target.value)} placeholder="Título del documento histórico" />
                </F>
                <F label="Descripción breve" wide>
                  <textarea className="form-textarea" value={form.arc_desc} onChange={(e) => s('arc_desc', e.target.value)} placeholder="Descripción del contenido del documento..." rows={3} />
                </F>
              </div>
            </Card>

            <Card title="Referencias y clasificación">
              <div className="form-grid-2">
                <F label="Origen">
                  <input className="form-input" type="text" value={form.arc_orig} onChange={(e) => s('arc_orig', e.target.value)} placeholder="Institución o persona de origen" />
                </F>
                <F label="Categoría">
                  <input className="form-input" type="text" value={form.arc_cate} onChange={(e) => s('arc_cate', e.target.value)} placeholder="Ej: Inventario, Acta, Libro sacramental..." />
                </F>
              </div>
            </Card>

            <Card title="Numeración y fechas">
              <div className="form-grid-3">
                <F label="Año">
                  <input className="form-input" type="number" value={form.arc_año} onChange={(e) => s('arc_año', e.target.value)} min="1500" max="2100" />
                </F>
                <F label="Número protocolar">
                  <input className="form-input" type="text" value={form.arc_npro} onChange={(e) => s('arc_npro', e.target.value)} />
                </F>
                <F label="Segmento">
                  <select className="form-select" value={form.arc_seg} onChange={(e) => s('arc_seg', e.target.value)}>
                    <option value="">Seleccionar</option>
                    {SEGMENTOS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </F>
              </div>
            </Card>

            <Card title="Asunto y alcances">
              <div className="form-grid-2">
                <F label="Tema"><input className="form-input" type="text" value={form.arc_tema} onChange={(e) => s('arc_tema', e.target.value)} /></F>
                <F label="Área"><input className="form-input" type="text" value={form.arc_area} onChange={(e) => s('arc_area', e.target.value)} /></F>
                <F label="Asunto" wide><input className="form-input" type="text" value={form.arc_asun} onChange={(e) => s('arc_asun', e.target.value)} /></F>
                <F label="Iniciador"><input className="form-input" type="text" value={form.arc_inic} onChange={(e) => s('arc_inic', e.target.value)} /></F>
                <F label="Destinatarios"><input className="form-input" type="text" value={form.arc_dest} onChange={(e) => s('arc_dest', e.target.value)} /></F>
              </div>
            </Card>

            
          </div>
        )}

        {/* ── Tab: Almacenamiento ── */}
        {tab === 'almacenamiento' && (
          <div>
            <Card title="Grupos y series">
              <div className="form-grid-3">
                <F label="Grupo"><input className="form-input" type="text" value={form.arc_grup} onChange={(e) => s('arc_grup', e.target.value)} placeholder="Ej: Registros sacramentales" /></F>
                <F label="Serie"><input className="form-input" type="text" value={form.arc_seri} onChange={(e) => s('arc_seri', e.target.value)} /></F>
                <F label="Sub serie"><input className="form-input" type="text" value={form.arc_sser} onChange={(e) => s('arc_sser', e.target.value)} /></F>
              </div>
            </Card>

            <Card title="Conservación y ubicación">
              <div className="flex flex-col gap-5">
                <div className="form-grid-2">
                  <F label="Soporte"><input className="form-input" type="text" value={form.arc_sopo} onChange={(e) => s('arc_sopo', e.target.value)} placeholder="Ej: Papel, Pergamino..." /></F>
                  <F label="Estado de conservación"><select className="form-select" value={form.arc_esta} onChange={(e) => s('arc_esta', e.target.value)}>{ESTADOS.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Cond. de acceso"><select className="form-select" value={form.arc_conA} onChange={(e) => s('arc_conA', e.target.value)}>{CONDICIONES.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Cond. de reproducción"><select className="form-select" value={form.arc_conR} onChange={(e) => s('arc_conR', e.target.value)}>{COND_REPRO.map((v) => <option key={v} value={v}>{v}</option>)}</select></F>
                  <F label="Lengua / Escritura"><input className="form-input" type="text" value={form.arc_leng} onChange={(e) => s('arc_leng', e.target.value)} placeholder="Ej: Español, Latín..." /></F>
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
              <textarea className="form-textarea" value={form.arc_obse} onChange={(e) => s('arc_obse', e.target.value)} rows={4} placeholder="Observaciones del archivero..." />
            </Card>
          </div>
        )}

        {/* ── Tab: Archivos ── */}
        {tab === 'archivos' && (
          <div className="card-section">
            <div className="section-header">Archivos adjuntos</div>
            <div className="card-body">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById('fi')?.click()}
                className={`mb-4 cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${dragOver ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/30'}`}
              >
                <Upload size={26} className={`mx-auto mb-3 ${dragOver ? 'text-sky-500' : 'text-slate-300'}`} />
                <p className="text-sm font-medium text-slate-600">
                  {dragOver ? 'Suelte los archivos aquí' : 'Haga clic o arrastre archivos aquí'}
                </p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</p>
                <input id="fi" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </div>

              {files.length > 0 && (
                <div className="flex flex-col gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-800 text-white">
                        <FileText size={13} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={() => setFiles((fl) => fl.filter((_, j) => j !== i))} className="text-slate-400 transition-colors hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Card title="Visibilidad">
              <div className="flex gap-3">
                {[{ v: 'publico', label: 'Público', desc: 'Visible para todos' }, { v: 'privado', label: 'Privado', desc: 'Solo administradores' }].map((opt) => (
                  <label key={opt.v} className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${form.arc_visw === opt.v ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <input type="radio" name="visibilidad" value={opt.v} checked={form.arc_visw === opt.v} onChange={(e) => s('arc_visw', e.target.value as any)} className="accent-sky-700" />
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




        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          <Link href="/registrar" className="btn-back">Cancelar y salir</Link>
          <div className="flex items-center gap-2.5">
            {tab !== 'datos' && (
              <button className="btn-secondary" onClick={() => setTab(tab === 'archivos' ? 'almacenamiento' : 'datos')}>
                Anterior
              </button>
            )}
            {tab !== 'archivos' ? (
              <button className="btn-primary" onClick={() => setTab(tab === 'datos' ? 'almacenamiento' : 'archivos')}>
                Siguiente
              </button>
            ) : (
              <button className="btn-primary" onClick={submit} disabled={saving}>
                {saving ? 'Guardando...' : <><CheckCircle size={13} /> Aceptar y confirmar registro</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
