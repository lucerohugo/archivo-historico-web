/**
 * API Client centralizado para conectar con Django Backend
 * - Todas las llamadas CRUD pasan por aquí
 * - Backend URL: http://localhost:8000/api (ajusta según tu setup)
 */

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  isTokenExpired,
  handleUnauthorized,
} from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Renovación en curso: si varias llamadas la necesitan a la vez, comparten una sola petición
let refreshing: Promise<string | null> | null = null;

/**
 * Renovar la sesión con el refresh token. Devuelve el access nuevo o null si no se pudo.
 */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh = getRefreshToken();
      if (!refresh || isTokenExpired(refresh)) return null;
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        if (!response.ok) return null;
        const data: { access: string; refresh: string } = await response.json();
        setTokens(data.access, data.refresh);
        return data.access;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/**
 * Access token vigente, renovándolo antes si vence en menos de un minuto
 */
async function getValidAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (token && !isTokenExpired(token, 60)) return token;
  return refreshAccessToken();
}

/**
 * fetch autenticado: manda el JWT (renovándolo si hace falta) y, si el backend
 * lo rechaza, intenta renovar una vez más. Si la sesión ya no sirve, manda al login.
 */
async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const withToken = (token: string | null): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let token = await getValidAccessToken();
  let response = await fetch(url, withToken(token));

  if (response.status === 401) {
    token = await refreshAccessToken();
    if (token) response = await fetch(url, withToken(token));
    if (response.status === 401) handleUnauthorized();
  }
  return response;
}

/**
 * Convertir la respuesta de error del backend en un mensaje legible.
 * DRF devuelve {detail: "..."} o, en errores de validación, {campo: ["msg", ...]}.
 */
function mensajeDeError(errorData: any, status: number): string {
  if (errorData?.detail) return String(errorData.detail);
  if (errorData && typeof errorData === 'object') {
    const partes = Object.entries(errorData).map(([campo, msgs]) => {
      const texto = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
      return campo === 'non_field_errors' ? texto : `${campo}: ${texto}`;
    });
    if (partes.length > 0) return partes.join(' | ');
  }
  if (status === 413) return 'El archivo es demasiado grande.';
  return `Error ${status}`;
}

/**
 * Hacer fetch a la API con manejo de errores
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    // /public/* y /auth/* son anónimos: nunca deben mandar el token guardado,
    // aunque exista uno viejo/inválido en localStorage (si no, la autenticación
    // JWT falla ANTES de llegar al permiso AllowAny y rompe login/catálogo público)
    const skipAuth = endpoint.startsWith('/public/') || endpoint.startsWith('/auth/');
    const init: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };
    const response = skipAuth ? await fetch(url, init) : await authFetch(url, init);

    // Si no es 2xx
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: mensajeDeError(errorData, response.status),
        status: response.status,
      };
    }

    // 204 No Content u otras respuestas sin body (ej. DELETE)
    if (response.status === 204) {
      return { status: response.status };
    }
    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;
    return { data, status: response.status };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}

// ================================================================
// REGISTROS HISTÓRICOS
// ================================================================

export interface RegistroHistoricoDTO {
  arc_codi?: number; // Auto
  arc_fech: string | null; // Fecha (YYYY-MM-DD)
  arc_titu: string; // Título
  arc_desc?: string; // Descripción
  arc_orig?: string; // Origen
  arc_cate?: string; // Categoría
  arc_año?: number | null; // Año
  arc_npro?: string; // Número protocolar
  arc_fechE?: string | null; // Fecha exacta
  arc_seg?: string; // Segmento
  arc_fini?: string; // Fecha inicial
  arc_ffin?: string; // Fecha final
  arc_tema?: string; // Tema
  arc_area?: string; // Área
  arc_asun?: string; // Asunto
  arc_inic?: string; // Iniciador
  arc_dest?: string; // Destinatario
  arc_pcla?: string; // Palabras clave
  arc_grup?: string; // Grupo
  arc_seri?: string; // Serie
  arc_sser?: string; // Subserie
  arc_sopo?: string; // Soporte
  arc_esta?: string; // Estado
  arc_conA?: string; // Condición de acceso
  arc_conR?: string; // Condición de reproducción
  arc_leng?: string; // Lengua
  arc_orco?: boolean; // Original/Copia
  arc_lugD?: string; // Lugar destino
  arc_ubsa?: string; // Ubicación sala
  arc_pasi?: string; // Pasillo
  arc_estan?: string; // Estantería
  arc_casi?: string; // Casillero
  arc_caja?: string; // Caja número
  arc_lega?: string; // Legajo
  arc_nume?: string; // Número
  arc_foli?: string; // Folios
  arc_hoja?: string; // Hojas
  arc_cari?: string; // Carillas
  arc_medi?: string; // Medidas
  arc_obse?: string; // Nota archivero
  arc_parroquia?: number;
  arc_sacerdote?: number;
  arc_exp?: boolean;
  arc_visw?: boolean;
  arc_acti?: boolean;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ArchivoAdjuntoDTO {
  id: number;
  registro: number;
  archivo: string; // URL del archivo servido por el backend
  nombre: string;
  tipo: 'pdf' | 'imagen' | 'documento' | 'otro';
  descripcion?: string;
  fecha_carga: string;
}

export interface RegistrosQueryParams {
  page?: number;
  search?: string;
  anioDesde?: string | number;
  anioHasta?: string | number;
  fechaDesde?: string;
  fechaHasta?: string;
  categoria?: string;
  ordering?: string;
}

function buildRegistrosQuery(params: RegistrosQueryParams = {}): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.search) qs.set('search', params.search);
  if (params.anioDesde) qs.set('arc_año_min', String(params.anioDesde));
  if (params.anioHasta) qs.set('arc_año_max', String(params.anioHasta));
  if (params.fechaDesde) qs.set('arc_fech_desde', params.fechaDesde);
  if (params.fechaHasta) qs.set('arc_fech_hasta', params.fechaHasta);
  if (params.categoria) qs.set('arc_cate', params.categoria);
  if (params.ordering) qs.set('ordering', params.ordering);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * GET - Obtener registros paginados (requiere login)
 */
export async function getRegistros(params: RegistrosQueryParams = {}) {
  return apiCall<Paginated<RegistroHistoricoDTO>>(`/registros/${buildRegistrosQuery(params)}`);
}

/**
 * GET - Obtener categorías distintas (requiere login)
 */
export async function getRegistrosCategorias() {
  return apiCall<string[]>('/registros/categorias/');
}

/**
 * GET - Conteos totales de registros (público/privado), calculados en el backend
 */
export async function getRegistrosStats() {
  return apiCall<{ total: number; publicos: number; privados: number }>('/registros/stats/');
}

/**
 * GET - Obtener registros públicos paginados (sin login)
 */
export async function getRegistrosPublicos(params: RegistrosQueryParams = {}) {
  return apiCall<Paginated<RegistroHistoricoDTO>>(`/public/registros/${buildRegistrosQuery(params)}`);
}

/**
 * GET - Obtener categorías distintas públicas (sin login)
 */
export async function getRegistrosPublicosCategorias() {
  return apiCall<string[]>('/public/registros/categorias/');
}

/**
 * GET - Obtener un registro público específico
 */
export async function getRegistroPublico(id: number) {
  return apiCall<RegistroHistoricoDTO & { archivos: ArchivoAdjuntoDTO[] }>(`/public/registros/${id}/`);
}

/**
 * GET - Obtener un registro específico
 */
export async function getRegistro(id: number) {
  return apiCall<RegistroHistoricoDTO & { archivos: ArchivoAdjuntoDTO[] }>(`/registros/${id}/`);
}

/**
 * POST - Crear nuevo registro
 */
export async function createRegistro(data: RegistroHistoricoDTO) {
  return apiCall('/registros/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT - Actualizar registro
 */
export async function updateRegistro(id: number, data: Partial<RegistroHistoricoDTO>) {
  return apiCall(`/registros/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE - Eliminar registro
 */
export async function deleteRegistro(id: number) {
  return apiCall(`/registros/${id}/`, {
    method: 'DELETE',
  });
}

// ================================================================
// AUTENTICACIÓN
// ================================================================

export interface AuthUsuarioDTO {
  id: number;
  log_usua: string;
  log_rol: 'ADMIN' | 'CONSULTA';
}

export interface AuthResponseDTO {
  access: string;
  refresh: string;
  usuario: AuthUsuarioDTO;
}

/**
 * POST - Login contra el backend (usuario + contraseña, modelo Login)
 */
export async function login(log_usua: string, log_clav: string) {
  return apiCall<AuthResponseDTO>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ log_usua, log_clav }),
  });
}

// ================================================================
// ARCHIVOS ADJUNTOS
// ================================================================

/**
 * POST multipart - subir un archivo adjunto a un registro
 */
async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    // No seteamos Content-Type: el navegador arma el boundary del multipart automáticamente
    const response = await authFetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: mensajeDeError(errorData, response.status),
        status: response.status,
      };
    }

    const data = await response.json();
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}

function detectarTipoArchivo(file: File): ArchivoAdjuntoDTO['tipo'] {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tif', 'tiff', 'heic'].includes(ext)) return 'imagen';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'odt', 'ods', 'odp', 'rtf', 'csv'].includes(ext)) return 'documento';
  return 'otro';
}

/**
 * Subir un archivo adjunto para un registro ya existente
 */
export async function uploadArchivo(registroId: number, file: File) {
  const formData = new FormData();
  formData.append('registro', String(registroId));
  // El nombre en disco se acorta (el sistema de archivos admite hasta 255 bytes);
  // el nombre original completo se guarda aparte en 'nombre'
  const punto = file.name.lastIndexOf('.');
  const ext = punto > 0 ? file.name.slice(punto).slice(0, 10) : '';
  const base = punto > 0 ? file.name.slice(0, punto) : file.name;
  formData.append('archivo', file, base.slice(0, 80) + ext);
  formData.append('nombre', file.name.slice(0, 255)); // límite del campo en el backend
  formData.append('tipo', detectarTipoArchivo(file));
  return apiUpload<ArchivoAdjuntoDTO>('/archivos/', formData);
}

/**
 * Eliminar un archivo adjunto
 */
export async function deleteArchivo(id: number) {
  return apiCall(`/archivos/${id}/`, {
    method: 'DELETE',
  });
}

// ================================================================
// PARROQUIAS
// ================================================================

/**
 * GET - Obtener todas las parroquias
 */
export async function getParroquias() {
  return apiCall('/parroquias/');
}

// ================================================================
// SACERDOTES
// ================================================================

/**
 * GET - Obtener todos los sacerdotes
 */
export async function getSacerdotes() {
  return apiCall('/sacerdotes/');
}

// ================================================================
// PROVINCIAS Y LOCALIDADES
// ================================================================

export async function getProvincias() {
  return apiCall('/provincias/');
}

export async function getLocalidades() {
  return apiCall('/localidades/');
}
