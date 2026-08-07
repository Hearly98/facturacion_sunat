import { GetCustomer } from "src/app/customer/core/models";
import { GetDocument } from "src/app/document/core/models/get-document.model";
import { GetSaleDetailModel } from "src/app/sale-detail/core/models";
import { GetStateSaleModel } from "src/app/sale-state/core/models/get-state-sale.model";

export class SaleModel {
  venta_id: number = 0;
  serie_id: number = 0;
  numero_completo: string = "";
  fecha_emision: string = "";
  fecha_vencimiento: string = "";
  doc_id: number = 0;
  suc_id: number = 0;
  vendedor_id: number = 0;
  mp_id: number = 0;
  cli_id: number = 0;
  venta_total: number = 0;
  est: boolean = false;
  documento?: GetDocument;
  cliente?: GetCustomer;
  estado?: GetStateSaleModel;
  detalles?: GetSaleDetailModel[] = [];
}
