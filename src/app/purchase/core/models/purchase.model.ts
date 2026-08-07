export interface PurchaseDetailModel {
  id: number;
  purchaseId: number;
  productId: number;
  productName: string | null;
  productCode: string | null;
  productUnit: string | null;
  productUnitId: number | null;
  unitCost: number;
  quantity: number;
  total: number;
}

export interface PurchaseSupplierModel {
  id: number;
  name: string;
  document: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  bank: string | null;
  bankAccount: string | null;
}

export interface PurchaseModel {
  id: number;
  companyId: number;
  branchId: number;
  userId: number;
  documentId: number;
  serieId: number | null;
  supplierId: number | null;
  currencyId: number | null;
  paymentMethodId: number | null;
  number: string | null;
  issueDate: string | null;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountPending: number;
  notes: string | null;
  affectsStock: boolean;
  stateId: number;
  stateCode: string | null;
  stateName: string | null;
  supplier: PurchaseSupplierModel | null;
  currencyName: string | null;
  currencySymbol: string | null;
  branchName: string | null;
  userName: string | null;
  details: PurchaseDetailModel[];
}

export interface PurchasePaymentModel {
  id: number;
  purchaseId: number;
  amount: number;
  paymentDate: string | null;
  method: string | null;
  bankId: number | null;
  destinationBank: string | null;
  destinationAccount: string | null;
  paymentState: string | null;
  externalReference: string | null;
  notes: string | null;
  userName: string | null;
  active: boolean;
}
