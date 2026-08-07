export interface SerieDto {
  id: number;
  empresaId: number;
  numero: string;
  docCod: string;
  correlativo: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSerieDto {
  ser_num: string;
  doc_cod: string;
  ser_corr: number;
}

export interface UpdateSerieDto {
  id: number;
  ser_num: string;
  doc_cod: string;
  ser_corr: number;
}
