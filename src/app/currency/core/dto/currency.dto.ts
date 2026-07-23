export interface CurrencyDto {
  id: number | null;
  nombre: string;
  codigo: string;
  simbolo: string;
  activo: boolean;
}

export interface CreateCurrencyDto {
  nombre: string;
  codigo: string;
  simbolo: string;
}

export interface UpdateCurrencyDto {
  id: number;
  nombre: string;
  codigo: string;
  simbolo: string;
}
