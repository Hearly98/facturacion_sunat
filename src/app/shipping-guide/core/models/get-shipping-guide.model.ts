import { ShippingGuideModel } from './shipping-guide.model';
export class GetShippingGuideModel extends ShippingGuideModel {
  guia_id: number = 0;
  serie?: {
    ser_id: number;
    ser_num: string;
    doc_cod: string;
  };
  cliente?: {
    cli_id: number;
    cli_nom: string;
  };
}
