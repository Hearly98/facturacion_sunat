import { EmissionFamily, EmissionStatus, SendingPolicyType } from './emission.models';

export interface EmissionDto {
  id: number;
  familia: EmissionFamily;
  venta_id: number | null;
  tipo_documento: string;
  tipo_nombre: string;
  numero: string;
  documento_afectado: string | null;
  cliente: string;
  total: number;
  estado: EmissionStatus;
  fecha_emision: string | null;
  programada_para: string | null;
  fecha_limite: string | null;
  horas_restantes: number | null;
  intentos: number;
  proximo_intento_en: string | null;
  codigo_respuesta: string | null;
  descripcion_respuesta: string | null;
}

export interface EmissionDetailDto extends EmissionDto {
  observaciones: string[];
  hash: string | null;
  tiene_xml: boolean;
  tiene_cdr: boolean;
  historial: { numero: number; estado: EmissionStatus; codigo: string | null; descripcion: string | null; fecha: string | null }[];
}

export interface EmissionSummaryDto {
  total: number;
  por_estado: Partial<Record<EmissionStatus, number>>;
  pendientes: number;
  requieren_atencion: number;
}

export interface SendingPolicyDto {
  tipo: SendingPolicyType;
  hora_envio: string;
  dias_envio: number[];
  margen_seguridad_horas: number;
  advertencias: string[];
}
