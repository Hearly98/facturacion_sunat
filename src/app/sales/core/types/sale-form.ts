import { SaleDetailModel } from "src/app/sale-detail/core/models";

export interface SaleForm {
    venta_id: number | null;
    serie_id: number | null;
    fecha_emision: string | null;
    fecha_vencimiento: string | null;
    emp_id: number | null;
    suc_id: number | null;
    almacen_id: number | null;
    cli_id: number | null;
    vendedor_id: number | null;
    doc_id: number | null;
    mon_id: number | null;
    mp_cod: string | null;
    guia_id: number | null;
    cot_id: number | null;
    venta_subtotal: number | null;
    venta_igv: number | null;
    venta_total: number | null;
    venta_descuento: number | null;
    monto_acuenta: number | null;
    monto_pendiente: number | null;
    estado_id: number | null;
    venta_coment: string | null;
    afecta_stock: boolean | null;
    detalles: SaleDetailModel[] | null;
    cli_documento: string | null;
    cli_direcc: string | null;
    cli_correo: string | null;
    cli_telf: string | null;
    tip_id: number | null;
    prod_id: number | null;
}