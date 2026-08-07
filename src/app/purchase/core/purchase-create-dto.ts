import { PurchaseDetailCreteDTOForm } from 'src/app/purchase-detail/core/types';

export interface PurchaseCreateDto {
  idSucursal: number;
  idUsuario: number;
  idAlmacen: number | null;
  idDocumento: number | null;
  idProveedor: number | null;
  idMetodoPago: number | null;
  idMoneda: number | null;
  numero: string | null;
  fechaEmision: Date | null;
  comentario: string | null;
  afectaStock: boolean;
  detalles: PurchaseDetailCreteDTOForm[];
}
