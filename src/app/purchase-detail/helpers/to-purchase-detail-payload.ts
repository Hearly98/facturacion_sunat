import { PurchaseDetailCreteDTOForm, PurchaseDetailForm } from '../core/types';

// El backend (CompraDetalle) interpreta precioCompra como costo UNITARIO SIN IGV: con él calcula
// el total de la compra y el costo promedio del Kardex. precio_compra del formulario es el total
// de línea con IGV (solo para mostrar) y nunca debe viajar como precioCompra.
export const toPurchaseDetailPayload = (rows: PurchaseDetailForm[]): PurchaseDetailCreteDTOForm[] =>
  rows.map((v) => ({
    idProducto: v.prod_id,
    cantidad: v.cantidad,
    precioCompra: v.costo_unitario,
    descuento: v.dscto ?? 0,
  }));
