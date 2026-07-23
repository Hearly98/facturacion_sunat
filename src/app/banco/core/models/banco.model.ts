export interface Banco {
  id: number | null;
  companyId: number;
  name: string;
  accountNumber: string;
  accountType: string;
  currencyId: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
