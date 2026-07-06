export interface ArchivoAdjunto {
  id: number;
  nombre: string;
  tipo: string;
  url: string;
}

export interface Registro {
  id: number;
  codigo: string;
  fecha_recepcion: string;
  titulo_referencia: string;
  descripcion_breve: string;
  origen: string;
  categoria: string;
  anio: number;
  numero_protocolar: string;
  segmento: string;
  tema: string;
  area: string;
  asunto: string;
  iniciador: string;
  destinatarios: string;
  grupo: string;
  serie: string;
  sub_serie: string;
  soporte: string;
  estado_conservacion: string;
  cond_acceso: string;
  cond_reproduccion: string;
  lengua_escritura: string;
  original_copia: string;
  lugar_destino: string;
  ubicacion_sala: string;
  pasillo: string;
  estanteria: string;
  casillero: string;
  caja_nro: string;
  legajo: string;
  numero: string;
  folios: string;
  hojas: string;
  medidas: string;
  nota_archivero: string;
  visibilidad: 'publico' | 'privado';
  archivos: ArchivoAdjunto[];
  created_at: string;
}
