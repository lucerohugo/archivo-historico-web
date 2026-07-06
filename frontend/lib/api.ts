/**
 * API Client centralizado para conectar con Django Backend
 * - Todas las llamadas CRUD pasan por aquí
 * - Backend URL: http://localhost:8000/api (ajusta según tu setup)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Hacer fetch a la API con manejo de errores
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Si no es 2xx
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.detail || `Error ${response.status}`,
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
  arc_fech: string; // Fecha (YYYY-MM-DD)
  arc_titu: string; // Título
  arc_desc?: string; // Descripción
  arc_orig?: string; // Origen
  arc_cate?: string; // Categoría
  arc_año?: number | null; // Año
  arc_npro?: string; // Número protocolar
  arc_fechE?: string | null; // Fecha exacta
  arc_seg?: string; // Segmento
  arc_tema?: string; // Tema
  arc_area?: string; // Área
  arc_asun?: string; // Asunto
  arc_inic?: string; // Iniciador
  arc_dest?: string; // Destinatario
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

/**
 * GET - Obtener todos los registros (requiere login)
 */
export async function getRegistros() {
  return apiCall<RegistroHistoricoDTO[] | Paginated<RegistroHistoricoDTO>>('/registros/');
}

/**
 * GET - Obtener registros públicos (sin login)
 */
export async function getRegistrosPublicos() {
  return apiCall<RegistroHistoricoDTO[] | Paginated<RegistroHistoricoDTO>>('/public/registros/');
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
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.detail || errorData.archivo?.[0] || `Error ${response.status}`,
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
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'imagen';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'odt'].includes(ext)) return 'documento';
  return 'otro';
}

/**
 * Subir un archivo adjunto para un registro ya existente
 */
export async function uploadArchivo(registroId: number, file: File) {
  const formData = new FormData();
  formData.append('registro', String(registroId));
  formData.append('archivo', file);
  formData.append('nombre', file.name);
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
