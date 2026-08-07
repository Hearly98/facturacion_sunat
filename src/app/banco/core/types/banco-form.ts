export interface BancoForm {
  id: number | null;
  name: string | null;
  accountNumber: string | null;
  accountType: string | null;
  currencyId: number | null;
}

export interface BancoFilterForm {
  name: string | null;
  accountNumber: string | null;
}
