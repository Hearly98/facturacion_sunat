import { CreateSupplierDto } from './create-supplier.dto';

export interface UpdateSupplierDto extends CreateSupplierDto {
  id: number;
}
