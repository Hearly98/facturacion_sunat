export interface QuotationDetailModel {
  id: number;
  quotationId: number;
  productId: number;
  productName: string | null;
  productCode: string | null;
  productUnit: string | null;
  productUnitId: number | null;
  productWeight: number | null;
  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
  description: string | null;
}

export interface QuotationCustomerModel {
  id: number;
  name: string;
  document: string | null;
  documentTypeId: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface QuotationModel {
  id: number;
  companyId: number;
  branchId: number;
  customerId: number | null;
  currencyId: number | null;
  userId: number;
  number: string | null;
  fullNumber: string | null;
  issueDate: string | null;
  validUntilDate: string | null;
  showValidUntilDate: boolean;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactArea: string | null;
  showCurrency: boolean;
  subtotal: number;
  tax: number;
  taxRequired: boolean;
  total: number;
  showTotal: boolean;
  discount: number;
  notes: string | null;
  showNotes: boolean;
  paymentTerms: string | null;
  showPaymentTerms: boolean;
  paymentMethodId: number | null;
  showPaymentMethod: boolean;
  paymentForm: string | null;
  showPaymentForm: boolean;
  deliveryTime: string | null;
  showDeliveryTime: boolean;
  deliveryPlace: string | null;
  showDeliveryPlace: boolean;
  warranty: string | null;
  showWarranty: boolean;
  considerations: string | null;
  showConsiderations: boolean;
  complementaryService: string | null;
  showComplementaryService: boolean;
  stateId: number;
  stateCode: string | null;
  stateName: string | null;
  customer: QuotationCustomerModel | null;
  currencyName: string | null;
  currencySymbol: string | null;
  branchName: string | null;
  details: QuotationDetailModel[];
}
