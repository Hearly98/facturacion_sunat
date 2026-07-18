export interface SerieDto {
  id: number | null;
  code: string;
  number: string;
  counter: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSerieDto {
  code: string;
  number: string;
  counter: number;
}

export interface UpdateSerieDto {
  code: string;
  number: string;
  counter: number;
}
