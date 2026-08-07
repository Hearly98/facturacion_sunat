export interface UnitOfMeasureDto {
  id: number | null;
  codigo: string;
  nombre: string;
  abreviatura: string;
}

export interface CreateUnitOfMeasureDto {
  codigo: string;
  nombre: string;
  abreviatura: string;
}

export interface UpdateUnitOfMeasureDto {
  id: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
}
