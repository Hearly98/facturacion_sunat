export interface BrandDto {
  id: number | null;
  empresaId: number;
  nombre: string;
  codigo: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  nombre: string;
  codigo: string;
}

export interface UpdateBrandDto {
  id: number;
  nombre: string;
  codigo: string;
}
