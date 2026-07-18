export interface Sucursal {
  id: number | null;
  companyId: number;
  name: string;
  code: string;
  address: string;
  zip: string;
  department: string;
  province: string;
  district: string;
}
