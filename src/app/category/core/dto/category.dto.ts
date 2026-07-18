export interface CategoryDto {
  id: number | null;
  codigo: string;
  nombre: string;
}

export interface CreateCategoryDto {
  codigo: string;
  nombre: string;
}

export interface UpdateCategoryDto {
  id: number;
  codigo: string;
  nombre: string;
}
