import { GetCustomerModel } from "src/app/customer/core/models";
import { GetQuotationStateModel } from "src/app/quotation-state/models";

export interface QuotationModel {
  cot_id: number;
  serie_id: number;
  numero_completo: string;
  fecha_emision: string;
  fecha_valido_hasta: string;
  cli_id: number;
  cot_total: number;
  est: boolean;
  serie?: {
    ser_id: number;
    ser_num: string;
    doc_cod: string;
  };
  cliente?: GetCustomerModel;
  detalles: QuotationDetailModel[];
  estado_cotizacion?: GetQuotationStateModel
}

export interface QuotationDetailModel {
  cdet_id: number;
  cot_id: number;
  prod_id: number;
  cantidad: number;
  precio_unitario: number;
  descripcion: string;
  descuento: number;
  producto?: {
    prod_id: number;
    prod_nom: string;
    prod_cod: string;
    unidad: string;
  };
}
