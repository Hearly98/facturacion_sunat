export interface CurrencyDto {
  id: number | null;
  nombre: string;
  codigo: string;
  simbolo: string;
  est: boolean;
}

export interface CreateCurrencyDto {
  nombre: string;
  codigo: string;
  simbolo: string;
}

export interface UpdateCurrencyDto {
  nombre: string;
  codigo: string;
  simbolo: string;
}
