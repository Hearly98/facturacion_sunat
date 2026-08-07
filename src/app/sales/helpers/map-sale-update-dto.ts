import { SaleDetailModel } from 'src/app/sale-detail/core/models';
import { SaleForm } from '../core/types';

export function mapSaleUpdateDto(formValue: SaleForm) {
  return {
    venta_id: formValue.venta_id,
    suc_id: formValue.suc_id!,
    doc_id: formValue.doc_id!,
    cli_id: formValue.cli_id!,
    mp_cod: formValue.mp_cod!,
    mon_id: formValue.mon_id!,
    vendedor_id: formValue.vendedor_id!,
    fecha_emision: formValue.fecha_emision!,
    observaciones: formValue.venta_coment || '',
    afecta_stock: formValue.afecta_stock ?? true,
    detalles: (formValue.detalles || []).map((d: any) => ({
      prod_id: d.prod_id,
      detv_cant: d.cantidad,
      prod_pventa: d.precio_venta,
      detv_descuento: d.dscto,
      detv_total: 0,
    } as SaleDetailModel)),
  };
}
