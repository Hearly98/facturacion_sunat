export interface BrandDto {
  id: number | null;
  empresaId: number;
  nombre: string;
  codigo: string;
  est: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  nombre: string;
  codigo: string;
}

export interface UpdateBrandDto {
  nombre: string;
  codigo: string;
}
