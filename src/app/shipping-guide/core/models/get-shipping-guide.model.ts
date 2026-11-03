import { ShippingGuideModel } from './shipping-guide.model';
import { CustomerDto } from 'src/app/customer/core/dto';

export class GetShippingGuideModel extends ShippingGuideModel {
  /** El backend devuelve el modelo crudo: la clave es `id`, no `guia_id`. */
  id: number = 0;
  estado_guia_remision?: { codigo: string; nombre: string } | null;
  serie?: {
    ser_id: number;
    ser_num: string;
    doc_cod: string;
  };
  cliente?: CustomerDto;
}
