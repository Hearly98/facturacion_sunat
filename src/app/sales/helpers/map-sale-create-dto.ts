import { SaleForm } from '../core/types';

export function mapSaleCreateDto(formValue: SaleForm) {
  return {
    idSucursal: formValue.suc_id!,
    idAlmacen: formValue.almacen_id ?? null,
    idDocumento: formValue.doc_id!,
    idUsuario: formValue.vendedor_id!,
    idCliente: formValue.cli_id ?? null,
    idMoneda: formValue.mon_id ?? null,
    idSerie: formValue.serie_id ?? null,
    idMetodoPago: formValue.mp_cod ?? null,
    idGuia: formValue.guia_id ?? null,
    idCotizacion: formValue.cot_id ?? null,
    fechaEmision: formValue.fecha_emision!,
    afectaStock: formValue.afecta_stock ?? true,
    descuento: formValue.venta_descuento ?? 0,
    montoAlCuenta: formValue.monto_acuenta ?? 0,
    comentarios: formValue.venta_coment || null,
    detalles: (formValue.detalles || []).map((d: any) => ({
      idProducto: d.prod_id,
      cantidad: d.cantidad,
      precioVenta: d.precio_unitario ?? d.precio_venta,
      descuento: d.dscto ?? 0,
    })),
  };
}
