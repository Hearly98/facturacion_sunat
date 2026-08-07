export interface CreateSupplier {
  companyId: number;
  documentTypeId: number | null;
  name: string;
  document: string;
  phone: string;
  address: string;
  email: string;
  bank: string | null;
  account: string | null;
  active: boolean;
}
