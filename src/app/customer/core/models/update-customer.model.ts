export interface UpdateCustomer {
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
  department: string;
  province: string;
  district: string;
}

export type UpdateCustomerType = UpdateCustomer;
