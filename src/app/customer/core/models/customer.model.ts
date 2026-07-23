export interface Customer {
  id: number;
  companyId: number;
  firstName: string;
  lastName: string;
  businessName: string;
  document: string;
  phone: string;
  address: string;
  email: string;
  ubigeoCode: string;
  documentTypeId: number;
}

export type CustomerType = Customer;
