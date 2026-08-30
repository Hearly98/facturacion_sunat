import { ShippingGuideModel } from './shipping-guide.model';
import { CustomerDto } from 'src/app/customer/core/dto';

export class GetShippingGuideModel extends ShippingGuideModel {
  guia_id: number = 0;
  serie?: {
    ser_id: number;
    ser_num: string;
    doc_cod: string;
  };
  cliente?: CustomerDto;
}
