import { SunatStatus } from 'src/app/sunat/core/models/sunat.models';

/**
 * Fila del historial de ventas tal como la devuelve POST /ventas/search
 * (VentaMapper::modelToSearchDto en el backend). Solo campos planos.
 */
export interface SaleListItemModel {
  id: number;
  numero_completo: string;
  fecha_emision: string;
  /** El backend lo envía como decimal en texto ("118.00"); se normaliza con toSaleListItem. */
  total: number;
  estado_id: number;
  estado_nombre: string | null;
  documento_codigo: string | null;
  documento_nombre: string | null;
  cliente_nombre: string;
  cliente_documento: string | null;
  sunat: {
    estado: SunatStatus;
    codigo: string | null;
    descripcion: string | null;
  };
}

/** Normaliza una fila cruda de la búsqueda (los decimales de Laravel llegan como texto). */
export const toSaleListItem = (raw: SaleListItemModel): SaleListItemModel => ({
  ...raw,
  total: Number(raw.total),
});
