import { CreateSaleModel, SaleForm } from '../core/types';
import { SaleDetailModel } from 'src/app/sale-detail/core/models';

export function mapSaleCreateDto(formValue: SaleForm) {
  return {
    suc_id: formValue.suc_id!,
    almacen_id: formValue.almacen_id ?? null,
    doc_id: formValue.doc_id!,
    emp_id: formValue.emp_id!,
    cli_id: formValue.cli_id!,
    mp_id: formValue.mp_id!,
    mon_id: formValue.mon_id!,
    vendedor_id: formValue.vendedor_id!,
    fecha_emision: formValue.fecha_emision!,
    venta_coment: formValue.venta_coment || '',
    afecta_stock: formValue.afecta_stock ?? true,
    guia_id: formValue.guia_id ?? null,
    fecha_vencimiento: formValue.fecha_vencimiento,
    cot_id: formValue.cot_id ?? null,
    detalles: (formValue.detalles || []).map((d: any) => ({
      prod_id: d.prod_id,
      detv_cant: d.cantidad,
      prod_pventa: d.precio_unitario ?? d.precio_venta,
      detv_descuento: d.dscto,
      detv_total: 0,
    } as SaleDetailModel)),
  };
}
