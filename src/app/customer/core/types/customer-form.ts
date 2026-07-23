export interface CustomerForm {
  id: number | null;
  companyId: number | null;
  documentTypeId: number | null;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  document: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  ubigeoCode: string | null;
}
