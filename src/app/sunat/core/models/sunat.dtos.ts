import { SendingPolicyDto } from 'src/app/emissions/core/models/emission.dtos';
import { CreditNoteReason, SunatEnvironment } from './sunat.models';

export interface SunatConfigDto {
  ambiente: SunatEnvironment;
  auto_envio: boolean;
  max_intentos: number;
  timeout_segundos: number;
  politica?: SendingPolicyDto;
  credenciales: {
    sol_usuario: string | null;
    tiene_clave_sol: boolean;
    tiene_certificado: boolean;
    certificado_vence: string | null;
  };
}


export interface CreditNoteLineDto {
  venta_detalle_id: number;
  codigo: string;
  nombre: string;
  precio_unitario: number;
  cantidad_vendida: number;
  cantidad_devuelta: number;
  cantidad_disponible: number;
}

export interface CreditNoteDto {
  id: number;
  venta_id: number;
  documento_afectado: string | null;
  numero: string;
  fecha_emision: string;
  motivo_codigo: CreditNoteReason;
  motivo_descripcion: string;
  total: number;
}
